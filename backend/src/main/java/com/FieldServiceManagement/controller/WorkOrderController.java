package com.FieldServiceManagement.controller;
import com.FieldServiceManagement.dto.AssignRequest;
import com.FieldServiceManagement.dto.WorkOrderRequest;
import com.FieldServiceManagement.dto.WorkOrderResponse;
import com.FieldServiceManagement.service.WorkOrderService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/work-orders")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER', 'CUSTOMER')")
    public ResponseEntity<WorkOrderResponse> create(@Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<WorkOrderResponse>> list(
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return ResponseEntity.ok(workOrderService.list(status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workOrderService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public ResponseEntity<WorkOrderResponse> update(@PathVariable Long id, @Valid @RequestBody WorkOrderRequest request) {
        return ResponseEntity.ok(workOrderService.update(id, request));
    }
    @PostMapping("/{id}/assign")
@PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
public ResponseEntity<WorkOrderResponse> assign(@PathVariable Long id, @Valid @RequestBody AssignRequest request) {
    return ResponseEntity.ok(workOrderService.assign(id, request.getTechnicianId()));
}
}