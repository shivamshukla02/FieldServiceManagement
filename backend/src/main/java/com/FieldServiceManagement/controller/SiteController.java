package com.FieldServiceManagement.controller;

import com.FieldServiceManagement.dto.SiteRequest;
import com.FieldServiceManagement.dto.SiteResponse;
import com.FieldServiceManagement.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('DISPATCHER', 'MANAGER')")
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody SiteRequest request) {
        return ResponseEntity.ok(siteService.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<SiteResponse>> listByCustomer(
            @RequestParam Long customerId,
            Pageable pageable) {
        return ResponseEntity.ok(siteService.listByCustomer(customerId, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SiteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(siteService.getById(id));
    }
}