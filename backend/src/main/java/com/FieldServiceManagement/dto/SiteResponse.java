package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class SiteResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String name;
    private String address;
    private LocalDateTime createdAt;
}