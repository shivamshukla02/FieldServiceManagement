package com.FieldServiceManagement.controller;

import com.FieldServiceManagement.dto.*;
import com.FieldServiceManagement.service.PartTimeLoggingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders/{workOrderId}")
public class PartTimeLoggingController {

    private final PartTimeLoggingService service;

    public PartTimeLoggingController(PartTimeLoggingService service) {
        this.service = service;
    }

    @PostMapping("/parts")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'DISPATCHER', 'MANAGER')")
    public ResponseEntity<PartUsageResponse> logPart(@PathVariable Long workOrderId, @Valid @RequestBody PartUsageRequest request) {
        return ResponseEntity.ok(service.logPartUsage(workOrderId, request));
    }

    @GetMapping("/parts")
    public ResponseEntity<List<PartUsageResponse>> getParts(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(service.getPartUsage(workOrderId));
    }

    @PostMapping("/time")
    @PreAuthorize("hasRole('TECHNICIAN')")
    public ResponseEntity<TimeLogResponse> logTime(@PathVariable Long workOrderId, @Valid @RequestBody TimeLogRequest request) {
        return ResponseEntity.ok(service.logTime(workOrderId, request));
    }

    @GetMapping("/time")
    public ResponseEntity<List<TimeLogResponse>> getTime(@PathVariable Long workOrderId) {
        return ResponseEntity.ok(service.getTimeLogs(workOrderId));
    }
}