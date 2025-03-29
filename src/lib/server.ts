type Server = {
    init: () => void;
}

const server = {} as Server;

server.init = () => {
    console.log('inicijuojame serveri...');
}

export { server };