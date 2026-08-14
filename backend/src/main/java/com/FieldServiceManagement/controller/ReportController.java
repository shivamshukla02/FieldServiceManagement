package com.FieldServiceManagement.controller;

import com.FieldServiceManagement.dto.DashboardSummary;
import com.FieldServiceManagement.service.WorkOrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final WorkOrderService workOrderService;

    public ReportController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
    public ResponseEntity<DashboardSummary> summary() {
        return ResponseEntity.ok(workOrderService.getDashboardSummary());
    }
}