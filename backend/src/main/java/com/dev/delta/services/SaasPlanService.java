package com.dev.delta.services;

import com.dev.delta.entities.SaasPlan;
import com.dev.delta.repositories.SaasPlanRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SaasPlanService {

    private final SaasPlanRepository repo;

    public SaasPlanService(SaasPlanRepository repo) {
        this.repo = repo;
    }

    public List<SaasPlan> findAll() {
        return repo.findAllByOrderBySortOrderAsc();
    }

    public List<SaasPlan> findPublic() {
        return repo.findByEnabledTrueAndHiddenFalseOrderBySortOrderAsc();
    }

    public Optional<SaasPlan> findById(Long id) {
        return repo.findById(id);
    }

    public Optional<SaasPlan> findByKey(String key) {
        return repo.findByPlanKey(key);
    }

    public SaasPlan save(SaasPlan plan) {
        return repo.save(plan);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
