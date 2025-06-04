package rs.ac.singidunum.basic_ticket_manager.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import rs.ac.singidunum.basic_ticket_manager.enums.Priority;
import rs.ac.singidunum.basic_ticket_manager.enums.Status;
import rs.ac.singidunum.basic_ticket_manager.enums.Type;

import java.time.LocalDate;

@Entity
@Table
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ticket_id", nullable = false)
    private int ticketId;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User assignedTo;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;

    private LocalDate deadline;

}
