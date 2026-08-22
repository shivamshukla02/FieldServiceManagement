package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.Organization;
import com.FieldServiceManagement.repository.OrganizationRepository;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    public Organization createOrganization(String name) {
        Organization org = new Organization();
        org.setName(name);
        org.setInviteCode(generateCode());
        return organizationRepository.save(org);
    }

    public Organization findByInviteCode(String code) {
        return organizationRepository.findByInviteCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Invalid invite code: " + code));
    }

    private String generateCode() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        Random random = new Random();
        StringBuilder code;
        do {
            code = new StringBuilder("KST-");
            for (int i = 0; i < 4; i++) code.append(chars.charAt(random.nextInt(chars.length())));
        } while (organizationRepository.findByInviteCode(code.toString()).isPresent());
        return code.toString();
    }
}