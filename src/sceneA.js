class sceneA extends Phaser.Scene {
    constructor() {
        super({ 
            key: "sceneA", 
            physics: { 
                default: 'arcade'
            } 
        });
    }

    preload() {
        this.load.image('fondo', './assets/Cave.gif');
        this.load.image('sub', './assets/Submarine.png');
        this.load.image('torpedo', './assets/plomo.png');
        this.load.image('tiburon', './assets/Shark.png');
        this.load.image('malo', './assets/malo.png');
        this.load.image('torpedoEnemigo', './assets/Circulo.png');
        this.load.image('buso', './assets/buzo.png'); // Nueva imagen del buzo
    }

    create() {
        // Fondo
        this.add.image(0, 0, 'fondo').setOrigin(0, 0);

        // Submarino jugador
        this.submarino = this.physics.add.sprite(400, 300, 'sub');
        this.submarino.setOrigin(0.5, 0.5);
        this.submarino.setCollideWorldBounds(true);
        this.submarino.setScale(0.5);
        this.submarino.direccion = 1; // 1 = derecha, -1 = izquierda

        // Grupos
        this.torpedos = this.physics.add.group();
        this.tiburones = this.physics.add.group();
        this.enemigos = this.physics.add.group();
        this.torpedosEnemigos = this.physics.add.group();
        this.busos = this.physics.add.group(); // Grupo para los buzos

        // Contador de buzos recolectados
        this.contadorBuzos = 0;
        this.textoContador = this.add.text(20, 20, 'Buzos: 0', { 
            font: '24px Arial',
            fill: '#FFFFFF',
            backgroundColor: '#000000'
        });

        // Teclado
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Eventos temporizados
        this.time.addEvent({ delay: 2000, callback: this.spawnTiburon, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 5000, callback: this.spawnEnemigo, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 3000, callback: this.disparoEnemigo, callbackScope: this, loop: true });
        this.time.addEvent({ delay: 8000, callback: this.spawnBuso, callbackScope: this, loop: true }); // Nuevo evento para buzos

        // Colisiones
        this.physics.add.overlap(this.submarino, this.tiburones, this.gameOver, null, this);
        this.physics.add.overlap(this.submarino, this.enemigos, this.gameOver, null, this);
        this.physics.add.overlap(this.submarino, this.torpedosEnemigos, this.gameOver, null, this);
        this.physics.add.overlap(this.torpedos, this.tiburones, this.torpedoGolpeaTiburon, null, this);
        this.physics.add.overlap(this.torpedos, this.enemigos, this.torpedoGolpeaEnemigo, null, this);
        this.physics.add.overlap(this.submarino, this.busos, this.recolectarBuso, null, this); // Nueva colisión para buzos

        // Botón Start
        this.botonStart = this.add.text(400, 300, 'START', {
            font: '30px Arial',
            fill: '#00FF00',
            backgroundColor: '#000000'
        })
        .setOrigin(0.5)
        .setInteractive()
        .setVisible(false)
        .on('pointerdown', () => {
            this.scene.restart();
        });
    }

    update() {
        if (this.physics.world.isPaused) return;

        // Movimiento del submarino
        const speed = 200;
        this.submarino.setVelocity(0);

        if (this.cursors.left.isDown) {
            // Cambiar dirección a izquierda
            this.submarino.direccion = -1;
            this.submarino.setFlipX(true);
            this.submarino.setVelocityX(-speed);
        } else if (this.cursors.right.isDown) {
            // Cambiar dirección a derecha
            this.submarino.direccion = 1;
            this.submarino.setFlipX(false);
            this.submarino.setVelocityX(speed);
        }

        if (this.cursors.up.isDown) {
            this.submarino.setVelocityY(-speed);
        } else if (this.cursors.down.isDown) {
            this.submarino.setVelocityY(speed);
        }

        // Disparo del jugador
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.fireTorpedo();
        }
    }

    fireTorpedo() {
        // Disparar en la dirección actual del submarino
        const offsetX = this.submarino.direccion === 1 ? 30 : -30;
        const torpedo = this.torpedos.create(
            this.submarino.x + offsetX,
            this.submarino.y,
            'torpedo'
        );
        torpedo.setVelocityX(500 * this.submarino.direccion); // Velocidad según dirección
        torpedo.setCollideWorldBounds(false);
        torpedo.setScale(0.5);
        torpedo.setFlipX(this.submarino.direccion === -1); // Voltear torpedo si va a izquierda
    }

    spawnTiburon() {
        const posY = Phaser.Math.Between(50, 550);
        const tiburon = this.tiburones.create(800, posY, 'tiburon');
        tiburon.setVelocityX(-200);
        tiburon.setScale(0.5);
    }

    spawnEnemigo() {
        const posY = Phaser.Math.Between(50, 550);
        const enemigo = this.enemigos.create(0, posY, 'malo');
        enemigo.setVelocityX(150); // Movimiento hacia derecha
        enemigo.setScale(0.5);
        enemigo.setFlipX(true); // Volteado para mirar hacia izquierda
    }

    spawnBuso() {
        const posY = Phaser.Math.Between(50, 550);
        const buso = this.busos.create(800, posY, 'buso');
        buso.setVelocityX(-150); // Movimiento hacia izquierda
        buso.setScale(0.5);
        buso.setCollideWorldBounds(false); // Para que desaparezca al salir de pantalla
    }

    disparoEnemigo() {
        this.enemigos.getChildren().forEach(enemigo => {
            const circulo = this.torpedosEnemigos.create(
                enemigo.x + 30,
                enemigo.y,
                'torpedoEnemigo' // Usa Circulo.png
            );
            circulo.setVelocityX(400); // Disparo hacia derecha
            circulo.setCollideWorldBounds(false);
            circulo.setScale(0.3); // Tamaño ajustado para el círculo
            circulo.setFlipX(true); // Volteado para coincidir con dirección
            
            // Animación de rotación continua
            this.tweens.add({
                targets: circulo,
                angle: 360,
                duration: 1000,
                repeat: -1
            });
        });
    }

    torpedoGolpeaTiburon(torpedo, tiburon) {
        torpedo.destroy();
        tiburon.destroy();
    }

    torpedoGolpeaEnemigo(torpedo, enemigo) {
        torpedo.destroy();
        enemigo.destroy();
    }

    recolectarBuso(submarino, buso) {
        buso.destroy(); // Eliminar el buzo
        this.contadorBuzos++; // Incrementar contador
        this.textoContador.setText(`Buzos: ${this.contadorBuzos}`); // Actualizar texto
    }

    gameOver() {
        this.physics.pause();
        this.submarino.setTint(0xFF0000);
        this.botonStart.setVisible(true);
        this.add.text(400, 200, 'GAME OVER', {
            font: '50px Arial',
            fill: '#FF0000'
        }).setOrigin(0.5);
    }
}

// Iniciar juego
new Phaser.Game(config);