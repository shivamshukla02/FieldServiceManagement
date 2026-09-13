package com.FieldServiceManagement.controller;

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
}