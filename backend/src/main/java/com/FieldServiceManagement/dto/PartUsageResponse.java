package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class PartUsageResponse {
    private Long id;
    private Long partId;
    private String partName;
    private Integer qtyUsed;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
}