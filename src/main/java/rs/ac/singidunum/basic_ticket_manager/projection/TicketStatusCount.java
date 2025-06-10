package rs.ac.singidunum.basic_ticket_manager.projection;

import rs.ac.singidunum.basic_ticket_manager.enums.Status;

public interface TicketStatusCount {
    Status getStatus();

    Long getCount();
}
