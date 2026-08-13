package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.*;
import com.FieldServiceManagement.dto.*;
import com.FieldServiceManagement.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PartTimeLoggingService {

    private final PartRepository partRepository;
    private final PartUsageRepository partUsageRepository;
    private final TimeLogRepository timeLogRepository;
    private final WorkOrderRepository workOrderRepository;
    private final UserRepository userRepository;

    public PartTimeLoggingService(PartRepository partRepository,
                                   PartUsageRepository partUsageRepository,
                                   TimeLogRepository timeLogRepository,
                                   WorkOrderRepository workOrderRepository,
                                   UserRepository userRepository) {
        this.partRepository = partRepository;
        this.partUsageRepository = partUsageRepository;
        this.timeLogRepository = timeLogRepository;
        this.workOrderRepository = workOrderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public PartUsageResponse logPartUsage(Long workOrderId, PartUsageRequest request) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        Part part = partRepository.findById(request.getPartId())
                .orElseThrow(() -> new RuntimeException("Part not found: " + request.getPartId()));

        if (part.getStockQty() < request.getQtyUsed()) {
            throw new IllegalStateException(
                    "Insufficient stock for " + part.getName() + ": have " + part.getStockQty() + ", need " + request.getQtyUsed()
            );
        }

        // decrement stock
        part.setStockQty(part.getStockQty() - request.getQtyUsed());
        partRepository.save(part);

        // record usage
        PartUsage usage = new PartUsage();
        usage.setWorkOrder(wo);
        usage.setPart(part);
        usage.setQtyUsed(request.getQtyUsed());
        PartUsage saved = partUsageRepository.save(usage);

        BigDecimal totalCost = part.getUnitCost().multiply(BigDecimal.valueOf(request.getQtyUsed()));

        return new PartUsageResponse(saved.getId(), part.getId(), part.getName(), saved.getQtyUsed(), part.getUnitCost(), totalCost);
    }

    public List<PartUsageResponse> getPartUsage(Long workOrderId) {
        return partUsageRepository.findByWorkOrderId(workOrderId).stream()
                .map(u -> new PartUsageResponse(
                        u.getId(),
                        u.getPart().getId(),
                        u.getPart().getName(),
                        u.getQtyUsed(),
                        u.getPart().getUnitCost(),
                        u.getPart().getUnitCost().multiply(BigDecimal.valueOf(u.getQtyUsed()))
                ))
                .toList();
    }

    @Transactional
    public TimeLogResponse logTime(Long workOrderId, TimeLogRequest request) {
        WorkOrder wo = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new RuntimeException("Work order not found: " + workOrderId));

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User technician = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        TimeLog log = new TimeLog();
        log.setWorkOrder(wo);
        log.setTechnician(technician);
        log.setMinutes(request.getMinutes());
        log.setNote(request.getNote());
        log.setLoggedAt(LocalDateTime.now());

        TimeLog saved = timeLogRepository.save(log);

        return new TimeLogResponse(saved.getId(), technician.getName(), saved.getMinutes(), saved.getNote(), saved.getLoggedAt());
    }

    public List<TimeLogResponse> getTimeLogs(Long workOrderId) {
        return timeLogRepository.findByWorkOrderId(workOrderId).stream()
                .map(t -> new TimeLogResponse(t.getId(), t.getTechnician().getName(), t.getMinutes(), t.getNote(), t.getLoggedAt()))
                .toList();
    }
}