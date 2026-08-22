package com.FieldServiceManagement.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OrgResponse {
    private Long id;
    private String name;
    private String inviteCode;
}