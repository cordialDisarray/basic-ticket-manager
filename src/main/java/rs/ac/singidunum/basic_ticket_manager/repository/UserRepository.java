package rs.ac.singidunum.basic_ticket_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rs.ac.singidunum.basic_ticket_manager.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
}
