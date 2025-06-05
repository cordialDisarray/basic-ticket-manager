package rs.ac.singidunum.basic_ticket_manager.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rs.ac.singidunum.basic_ticket_manager.entity.Ticket;
import rs.ac.singidunum.basic_ticket_manager.entity.User;

import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Integer> {

    List<Ticket> findByAssignedTo(User user);

    @Query("""
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE
                WHEN :order = 'asc' THEN
                    CASE ticket.priority
                        WHEN 'LOW' THEN 1
                        WHEN 'MEDIUM' THEN 2
                        WHEN 'HIGH' THEN 3
                        WHEN 'CRITICAL' THEN 4
                    END
                ELSE
                    CASE ticket.priority
                        WHEN 'CRITICAL' THEN 1
                        WHEN 'HIGH' THEN 2
                        WHEN 'MEDIUM' THEN 3
                        WHEN 'LOW' THEN 4
                    END
            END
            """)
    List<Ticket> findAllSortByPriority(@Param("order") String order);

    @Query("""
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE
                WHEN :order = 'desc' THEN
                    CASE ticket.status
                        WHEN 'DONE' THEN 1
                        WHEN 'REVIEW' THEN 2
                        WHEN 'IN_PROGRESS' THEN 3
                        WHEN 'TO-DO' THEN 4
                        WHEN 'BLOCKED' THEN 5
                        WHEN 'CANCELLED' THEN 6
                    END
                ELSE
                    CASE ticket.status
                        WHEN 'TO_DO' THEN 1
                        WHEN 'IN_PROGRESS' THEN 2
                        WHEN 'REVIEW' THEN 3
                        WHEN 'DONE' THEN 4
                        WHEN 'BLOCKED' THEN 5
                        WHEN 'CANCELLED' THEN 6
                    END
            END
            """)
    List<Ticket> findAllSortByStatus(@Param("order") String order);

    @Query("""
            SELECT ticket FROM Ticket ticket
            ORDER BY CASE
                WHEN :order = 'desc' THEN
                    CASE ticket.type
                        WHEN 'OTHER' THEN 1
                        WHEN 'REFACTOR' THEN 2
                        WHEN 'IMPROVEMENT' THEN 3
                        WHEN 'FEATURE' THEN 4
                        WHEN 'BUG' THEN 5
                        END
                ELSE
                    CASE ticket.type
                        WHEN 'BUG' THEN 1
                        WHEN 'FEATURE' THEN 2
                        WHEN 'IMPROVEMENT' THEN 3
                        WHEN 'REFACTOR' THEN 4
                        WHEN 'OTHER' THEN 5
                        END
            END
            """)
    List<Ticket> findAllSortByType(@Param("order") String order);

}
