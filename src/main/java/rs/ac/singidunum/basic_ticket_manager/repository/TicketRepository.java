package rs.ac.singidunum.basic_ticket_manager.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.entity.User;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;
import rs.ac.singidunum.basic_ticket_manager.projection.TicketPriorityCount;
import rs.ac.singidunum.basic_ticket_manager.projection.TicketStatusCount;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    List<Ticket> findByAssignedTo(User user);

    List<Ticket> findByAssignedToIsNull();

    Page<Ticket> findByStatus(Status status, Pageable pageable);

    Page<Ticket> findByType(Type type, Pageable pageable);

    Page<Ticket> findByPriority(Priority priority, Pageable pageable);

    @Query("SELECT ticket.priority AS priority, COUNT(ticket) AS count FROM Ticket ticket GROUP BY ticket.priority")
    List<TicketPriorityCount> countByPriority();

    @Query("SELECT ticket.status AS status, COUNT(ticket) AS count FROM Ticket ticket GROUP BY ticket.status")
    List<TicketStatusCount> countByStatus();

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.priority
                WHEN 'LOW' THEN 1
                WHEN 'MEDIUM' THEN 2
                WHEN 'HIGH' THEN 3
                WHEN 'CRITICAL' THEN 4
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByPriorityAsc(Pageable pageable);

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.priority
                WHEN 'CRITICAL' THEN 1
                WHEN 'HIGH' THEN 2
                WHEN 'MEDIUM' THEN 3
                WHEN 'LOW' THEN 4
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByPriorityDesc(Pageable pageable);

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.status
                WHEN 'TO_DO' THEN 1
                WHEN 'IN_PROGRESS' THEN 2
                WHEN 'REVIEW' THEN 3
                WHEN 'DONE' THEN 4
                WHEN 'BLOCKED' THEN 5
                WHEN 'CANCELLED' THEN 6
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByStatusAsc(Pageable pageable);

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.status
                WHEN 'DONE' THEN 1
                WHEN 'REVIEW' THEN 2
                WHEN 'IN_PROGRESS' THEN 3
                WHEN 'TO_DO' THEN 4
                WHEN 'BLOCKED' THEN 5
                WHEN 'CANCELLED' THEN 6
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByStatusDesc(Pageable pageable);

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.type
                WHEN 'OTHER' THEN 1
                WHEN 'REFACTOR' THEN 2
                WHEN 'IMPROVEMENT' THEN 3
                WHEN 'FEATURE' THEN 4
                WHEN 'BUG' THEN 5
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByTypeAsc(Pageable pageable);

    @Query(value = """
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE ticket.type
                WHEN 'BUG' THEN 1
                WHEN 'FEATURE' THEN 2
                WHEN 'IMPROVEMENT' THEN 3
                WHEN 'REFACTOR' THEN 4
                WHEN 'OTHER' THEN 5
            END
            """,
            countQuery = "SELECT COUNT(ticket) FROM Ticket ticket")
    Page<Ticket> findAllSortByTypeDesc(Pageable pageable);
}
