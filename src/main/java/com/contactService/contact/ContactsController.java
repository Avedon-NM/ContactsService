package com.contactService.contact;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
public class ContactsController {

    private ContactsService contactsService;

    @Autowired
    public ContactsController(ContactsService contactsService) {
        this.contactsService = contactsService;
    }

    @GetMapping("/")
    public List<HashMap<String, String>> getAll() {
    return contactsService.getAll();
    }

    @PostMapping("/importData")
    public List<HashMap<String, String>> importData(@RequestBody List<HashMap<String, String>> imports) {
        return contactsService.importData(imports);
    }

    @GetMapping("/searchNumber/{phoneNumber}")
    public List<HashMap<String, String>> searchNumber(@PathVariable String phoneNumber) {
        return contactsService.searchNumber(phoneNumber);
    }

    @GetMapping("/searchName/{name}")
    public List<HashMap<String, String>> searchName(@PathVariable String name) {
        return contactsService.searchName(name);
    }

    @GetMapping("/searchLocation/{cityTown}")
    public List<HashMap<String, String>> searchLocation(@PathVariable String cityTown) {
        return contactsService.searchLocation(cityTown);
    }

    @PutMapping("/updateContact")
    public List<HashMap<String, String>> updateContact(@RequestBody HashMap<String, String> contactInfo) {
        return contactsService.updateContact(contactInfo);
    }

    @DeleteMapping("/deleteContact/{phoneNumber}")
    public List<HashMap<String, String>> deleteContact(@PathVariable String phoneNumber) {
        return contactsService.deleteContact(phoneNumber);
    }

    @PostMapping("/addContact")
    public List<HashMap<String, String>> addContact(@RequestBody HashMap<String, String> contactInfo) {
        return contactsService.addContact(contactInfo);
    }

    @DeleteMapping("/deleteAll")
    public List<HashMap<String, String>> deleteAll() {
        return contactsService.deleteAll();
    }
}