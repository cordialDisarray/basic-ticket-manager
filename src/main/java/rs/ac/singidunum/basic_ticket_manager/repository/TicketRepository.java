package rs.ac.singidunum.basic_ticket_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.entity.User;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    List<Ticket> findByAssignedTo(User user);
}
