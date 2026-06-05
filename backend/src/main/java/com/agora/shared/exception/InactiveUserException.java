package com.agora.shared.exception;

public class InactiveUserException extends RuntimeException {

    public InactiveUserException() {
        super("El usuario esta inactivo");
    }
}

