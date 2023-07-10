import socket
import time
import argparse
import traceback

parser = argparse.ArgumentParser(description='RCTRando Archipelago Proxy')
parser.add_argument('--gameport', help='Port for OpenRCT2 to connect to')
parser.add_argument('--archaddr', help='Address for Archipelago server')
parser.add_argument('--archport', help='Port for Archipelago server')
parser.add_argument('--verbose', action="store_true", help="Output way more to the console")
args = parser.parse_args()

arch:socket = None
game:socket = None

def main():
    while True:
        try:
            proc()
        except Exception as e:
            print(e)
            print(traceback.format_exc())


def recv(sock):
    try:
        data = sock.recv(16384)
        if data and args.verbose:
            print('received', len(data), 'bytes from', sock.getpeername(), '->', sock.getsockname(),':\n', data)
        return data
    except socket.timeout as e:
        pass
    except BlockingIOError as e:
        pass
    return None

def send(sock, data):
    try:
        if data:
            sock.sendall(data)
            if args.verbose:
                print('sent', len(data), 'bytes to', sock.getsockname(), '->', sock.getpeername(),':\n', data)
    except socket.timeout as e:
        if args.verbose:
            print(e)
    except BlockingIOError as e:
        if args.verbose:
            print(e)


def tick():
    global arch, game

    # game -> arch
    data = None
    try:
        data = recv(game)
    except Exception as e:
        if args.verbose:
            print('error receiving from game', e)
        connectgame()
    try:
        if data:
            send(arch, data)
    except Exception as e:
        if args.verbose:
            print('error sending to Archipelago', e)
        connectarch()
        send(arch, data)

    # arch -> game
    data = None
    try:
        data = recv(arch)
    except Exception as e:
        if args.verbose:
            print('error receiving from Archipelago', e)
        connectarch()
    try:
        if data:
            send(game, data)
    except Exception as e:
        if args.verbose:
            print('error sending to game', e)
        connectgame()
        send(game, data)


def connectarch():
    global arch
    if arch:
        arch.shutdown(socket.SHUT_RDWR)
        arch.close()
    arch = None
    archport = int(args.archport)

    while True:
        try:
            arch = socket.create_connection((args.archaddr, archport))
            print("Connected to Archipelago at ", args.archaddr, archport)
            break
        except:
            if args.verbose:
                print(traceback.format_exc())
            print('error connecting to Archipelago', e)
            time.sleep(0.1)
    arch.setblocking(0)


def connectgame():
    global game
    if game:
        game.shutdown(socket.SHUT_RDWR)
        game.close()
    game = None
    gameport = int(args.gameport)
    while True:
        listener:socket = socket.create_server(("127.0.0.1",gameport))
        try:
            listener.settimeout(3)
            (game, addr) = listener.accept()
            print("Connected to game at", addr)
            break
        except socket.timeout as e:
            if args.verbose:
                print('error connecting to game', e)
        except BlockingIOError as e:
            if args.verbose:
                print('error connecting to game', e)
        except Exception as e:
            listener.close()
            if args.verbose:
                print(traceback.format_exc())
            print('error connecting to game', e)
            time.sleep(0.1)

    game.setblocking(0)
    try:
        listener.shutdown(socket.SHUT_RDWR)
    except:
        pass
    listener.close()


def connect():
    print("Connecting...")
    socket.setdefaulttimeout(10)
    connectarch()
    connectgame()


def proc():
    global arch, game
    connect()

    while True:
        tick()
        time.sleep(0.001)


if __name__ == "__main__":
    main()
