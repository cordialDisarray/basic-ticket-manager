package rs.ac.singidunum.basic_ticket_manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({"/", "/home", "/users", "/tickets"})
    public String forwardToIndex() {
        return "forward:/index.html";
    }
}
