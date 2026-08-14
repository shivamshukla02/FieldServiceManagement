package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.Customer;
import com.FieldServiceManagement.domain.Site;
import com.FieldServiceManagement.domain.WorkOrder;
import com.FieldServiceManagement.dto.DashboardSummary;
import com.FieldServiceManagement.dto.WorkOrderRequest;
import com.FieldServiceManagement.dto.WorkOrderResponse;
import com.FieldServiceManagement.repository.CustomerRepository;
import com.FieldServiceManagement.repository.SiteRepository;
import com.FieldServiceManagement.repository.WorkOrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderCodeGenerator codeGenerator;
    private final com.FieldServiceManagement.repository.UserRepository userRepository;

    public WorkOrderService(WorkOrderRepository workOrderRepository,
                             CustomerRepository customerRepository,
                             SiteRepository siteRepository,
                             WorkOrderCodeGenerator codeGenerator,
                             com.FieldServiceManagement.repository.UserRepository userRepository) {
        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.codeGenerator = codeGenerator;
        this.userRepository = userRepository;
    }

    public WorkOrderResponse create(WorkOrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));

        Site site = siteRepository.findById(request.getSiteId())
                .orElseThrow(() -> new RuntimeException("Site not found: " + request.getSiteId()));

        WorkOrder wo = new WorkOrder();
        wo.setCode(codeGenerator.generate());
        wo.setTitle(request.getTitle());
        wo.setDescription(request.getDescription());
        wo.setPriority(request.getPriority());
        wo.setStatus("NEW");
        wo.setSlaDueAt(calculateSlaDueDate(request.getPriority()));
        wo.setCustomer(customer);
        wo.setSite(site);
        wo.setCreatedAt(LocalDateTime.now());
        wo.setUpdatedAt(LocalDateTime.now());

        WorkOrder saved = workOrderRepository.save(wo);
        return toResponse(saved);
    }

    public Page<WorkOrderResponse> list(String status, Pageable pageable) {
        Page<WorkOrder> page = (status != null && !status.isBlank())
                ? workOrderRepository.findByStatus(status, pageable)
                : workOrderRepository.findAll(pageable);
        return page.map(this::toResponse);
    }

    public WorkOrderResponse getById(Long id) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));
        return toResponse(wo);
    }

    public WorkOrderResponse update(Long id, WorkOrderRequest request) {
        WorkOrder wo = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + id));

        if (wo.getStatus().equals("CLOSED") || wo.getStatus().equals("CANCELLED")) {
            throw new RuntimeException("Cannot edit a " + wo.getStatus() + " work order");
        }

        wo.setTitle(request.getTitle());
        wo.setDescription(request.getDescription());
        wo.setPriority(request.getPriority());
        wo.setUpdatedAt(LocalDateTime.now());

        WorkOrder saved = workOrderRepository.save(wo);
        return toResponse(saved);
    }

    public WorkOrderResponse assign(Long workOrderId, Long technicianId) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        if (!wo.getStatus().equals("NEW") && !wo.getStatus().equals("ASSIGNED")) {
            throw new RuntimeException("Cannot assign a work order in status: " + wo.getStatus());
        }

        var technician = userRepository.findById(technicianId)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + technicianId));

        wo.setAssignedTo(technician);
        wo.setStatus("ASSIGNED");
        wo.setUpdatedAt(LocalDateTime.now());

        WorkOrder saved = workOrderRepository.save(wo);
        return toResponse(saved);
    }

    public DashboardSummary getDashboardSummary() {
        List<WorkOrder> all = workOrderRepository.findAll();

        long newCount = all.stream().filter(w -> w.getStatus().equals("NEW")).count();
        long assignedCount = all.stream().filter(w -> w.getStatus().equals("ASSIGNED")).count();
        long inProgressCount = all.stream().filter(w -> w.getStatus().equals("IN_PROGRESS")).count();
        long onHoldCount = all.stream().filter(w -> w.getStatus().equals("ON_HOLD")).count();
        long completedCount = all.stream().filter(w -> w.getStatus().equals("COMPLETED")).count();
        long closedCount = all.stream().filter(w -> w.getStatus().equals("CLOSED")).count();

        long breachedCount = all.stream().filter(w -> calculateSlaStatus(w).equals("BREACHED")).count();
        long atRiskCount = all.stream().filter(w -> calculateSlaStatus(w).equals("AT_RISK")).count();

        return new DashboardSummary(newCount, assignedCount, inProgressCount, onHoldCount, completedCount, closedCount, breachedCount, atRiskCount);
    }

    private LocalDateTime calculateSlaDueDate(String priority) {
        LocalDateTime now = LocalDateTime.now();
        return switch (priority.toUpperCase()) {
            case "URGENT" -> now.plusHours(4);
            case "HIGH" -> now.plusHours(24);
            case "MEDIUM" -> now.plusHours(72);
            case "LOW" -> now.plusDays(7);
            default -> now.plusHours(72);
        };
    }

    private String calculateSlaStatus(WorkOrder wo) {
        if (wo.getStatus().equals("CLOSED") || wo.getStatus().equals("CANCELLED")) {
            return "N/A";
        }
        if (wo.getSlaDueAt() == null) {
            return "N/A";
        }
        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(wo.getSlaDueAt())) {
            return "BREACHED";
        }
        LocalDateTime warningThreshold = wo.getSlaDueAt().minusHours(2);
        if (now.isAfter(warningThreshold)) {
            return "AT_RISK";
        }
        return "ON_TRACK";
    }

    private WorkOrderResponse toResponse(WorkOrder wo) {
        return new WorkOrderResponse(
                wo.getId(),
                wo.getCode(),
                wo.getTitle(),
                wo.getDescription(),
                wo.getPriority(),
                wo.getStatus(),
                wo.getSlaDueAt(),
                wo.getCustomer().getId(),
                wo.getCustomer().getName(),
                wo.getSite().getId(),
                wo.getSite().getName(),
                wo.getAssignedTo() != null ? wo.getAssignedTo().getId() : null,
                wo.getAssignedTo() != null ? wo.getAssignedTo().getName() : null,
                wo.getCreatedAt(),
                wo.getUpdatedAt(),
                calculateSlaStatus(wo)
        );
    }
}