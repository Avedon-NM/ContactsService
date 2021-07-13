package com.contactService.contact;

import org.springframework.data.annotation.Id;

public class Contact {

    private String name;

    @Id
    private String phoneNumber;
    private String street;
    private String townCity;
    private String postcode;
    private int numEdits;

    public Contact(String name, String phoneNumber, String street, String townCity, String postcode) {
        this.name = name;
        this.phoneNumber = phoneNumber;
        this.street = street;
        this.townCity = townCity;
        this.postcode = postcode;
        this.numEdits = 0;
    }

    public String getName() {
        return name;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }
    

    public String getStreet() {
        return street;
    }

    public String getTownCity() {
        return townCity;
    }

    public String getPostcode() {
        return postcode;
    }

    public int getNumEdits() {
        return numEdits;
    }

    public void setNumEdits(int numEdits) {
        this.numEdits = numEdits;
    }

}