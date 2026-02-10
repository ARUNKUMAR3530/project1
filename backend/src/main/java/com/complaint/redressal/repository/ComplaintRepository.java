package com.complaint.redressal.repository;

import com.complaint.redressal.model.Complaint;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findByUserId(Long userId);
    List<Complaint> findByStatus(Complaint.Status status);
    List<Complaint> findByAssignedDepartmentId(Long departmentId);
}
