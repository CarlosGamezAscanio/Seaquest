
// Configuración inicial del juego
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 550,
    scene: sceneA,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

// Iniciar el juego
new Phaser.Game(config);