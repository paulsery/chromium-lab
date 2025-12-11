#!/usr/bin/env -S python3 -u

import sys, json, logging, logging.handlers

def get_message():
    """Reads a message from stdin, prefixed by its length."""
    raw_length = sys.stdin.buffer.read(4)
    if not raw_length:
        return None
    message_length = int.from_bytes(raw_length, byteorder='little')
    message = sys.stdin.buffer.read(message_length).decode('utf-8')
    return json.loads(message)

def send_message(message):
    """Sends a message to stdout, prefixed by its length."""
    encoded_message = json.dumps(message).encode('utf-8')
    sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))
    sys.stdout.buffer.write(encoded_message)
    sys.stdout.buffer.flush()

def log_message(message):
    logger = logging.getLogger('myapp')
    logger.setLevel(logging.DEBUG)
    syslog_handler = logging.handlers.SysLogHandler(address='/dev/log')  # Adjust for your OS
    logger.addHandler(syslog_handler)

    try:
        logger.info(message)
        with open('/var/log/browser.log', 'a') as f:
            f.write(json.dumps(message) + '\n')
    except Exception as e:
        encoded_message = json.dumps({'result': 'error writing to file'}).encode('utf-8')
        sys.stdout.buffer.write(len(encoded_message).to_bytes(4, byteorder='little'))
        sys.stdout.buffer.write(encoded_message)
        sys.stdout.buffer.flush()
 

def main():
    while True:
        received_message = get_message()
        if received_message is None:
            break # End of input, probably the browser closed the pipe

        # Process the message and send a response
        response_message = {"status": "success", "data": "Message logged: " + received_message.get('message', '')}

        log_message(received_message['payload'])

        send_message(response_message)

if __name__ == '__main__':
    main()
