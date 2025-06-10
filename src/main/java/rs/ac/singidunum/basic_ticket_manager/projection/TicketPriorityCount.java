package rs.ac.singidunum.basic_ticket_manager.projection;

import rs.ac.singidunum.basic_ticket_manager.enums.Priority;

public interface TicketPriorityCount {
    Priority getPriority();

    Long getCount();
}
