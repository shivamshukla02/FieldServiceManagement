package com.FieldServiceManagement.controller;
import org.springframework.security.access.prepost.PreAuthorize;
import com.FieldServiceManagement.domain.Part;
import com.FieldServiceManagement.repository.PartRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/parts")
public class PartController {

    private final PartRepository partRepository;

    public PartController(PartRepository partRepository) {
        this.partRepository = partRepository;
    }

    @GetMapping
    public ResponseEntity<List<Part>> getAll() {
        return ResponseEntity.ok(partRepository.findAll());
    }

    @DeleteMapping("/{id}")
@PreAuthorize("hasAnyRole('MANAGER', 'DISPATCHER')")
public ResponseEntity<Void> delete(@PathVariable Long id) {
    partRepository.deleteById(id);
    return ResponseEntity.noContent().build();
}
}