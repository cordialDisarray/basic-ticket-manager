package rs.ac.singidunum.basic_ticket_manager.service;

import rs.ac.singidunum.basic_ticket_manager.entity.User;

import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(int id);

    User createUser(User user);

    User updateUser(int id, User user);

    void deleteUser(int id);
}
