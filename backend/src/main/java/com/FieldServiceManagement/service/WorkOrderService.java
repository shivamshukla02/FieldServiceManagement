package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.Customer;
import com.FieldServiceManagement.domain.Site;
import com.FieldServiceManagement.domain.WorkOrder;
import com.FieldServiceManagement.dto.WorkOrderRequest;
import com.FieldServiceManagement.dto.WorkOrderResponse;
import com.FieldServiceManagement.repository.CustomerRepository;
import com.FieldServiceManagement.repository.SiteRepository;
import com.FieldServiceManagement.repository.WorkOrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WorkOrderService {

    private final WorkOrderRepository workOrderRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final WorkOrderCodeGenerator codeGenerator;

    public WorkOrderService(WorkOrderRepository workOrderRepository,
                             CustomerRepository customerRepository,
                             SiteRepository siteRepository,
                             WorkOrderCodeGenerator codeGenerator) {
        this.workOrderRepository = workOrderRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.codeGenerator = codeGenerator;
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
                wo.getUpdatedAt()
        );
    }
}