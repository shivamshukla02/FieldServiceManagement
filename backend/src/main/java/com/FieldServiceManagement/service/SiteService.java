package com.FieldServiceManagement.service;

import com.FieldServiceManagement.domain.Customer;
import com.FieldServiceManagement.domain.Site;
import com.FieldServiceManagement.dto.SiteRequest;
import com.FieldServiceManagement.dto.SiteResponse;
import com.FieldServiceManagement.repository.CustomerRepository;
import com.FieldServiceManagement.repository.SiteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final CustomerRepository customerRepository;

    public SiteService(SiteRepository siteRepository, CustomerRepository customerRepository) {
        this.siteRepository = siteRepository;
        this.customerRepository = customerRepository;
    }

    public SiteResponse create(SiteRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found: " + request.getCustomerId()));

        Site site = new Site();
        site.setCustomer(customer);
        site.setName(request.getName());
        site.setAddress(request.getAddress());

        Site saved = siteRepository.save(site);
        return toResponse(saved);
    }

    public Page<SiteResponse> listByCustomer(Long customerId, Pageable pageable) {
        return siteRepository.findByCustomerId(customerId, pageable)
                .map(this::toResponse);
    }

    public SiteResponse getById(Long id) {
        Site site = siteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Site not found: " + id));
        return toResponse(site);
    }

    private SiteResponse toResponse(Site s) {
        return new SiteResponse(
                s.getId(),
                s.getCustomer().getId(),
                s.getCustomer().getName(),
                s.getName(),
                s.getAddress(),
                s.getCreatedAt()
        );
    }
}