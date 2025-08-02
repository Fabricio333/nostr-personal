---
title: Password Manager v2
description: Bóveda de contraseñas determinística con respaldo descentralizado en Nostr.
links:
  demo: https://fabricio333.github.io/PasswordManagerWeb/
  source: https://github.com/Fabricio333/PasswordManagerWeb
---

## Características
- Gestor de contraseñas basado en el navegador y capaz de funcionar sin conexión usando frases semilla BIP39 y SHA-256 para la generación determinística de contraseñas.
- Copias de seguridad cifradas opcionales mediante el protocolo Nostr usando nip04, eventos kind:1 y derivación de claves desde la frase semilla.
- Cifrado de sesión local con protección AES basada en contraseña almacenada en localStorage.
- Enfoque en la privacidad y portabilidad: funciona totalmente sin conexión, es apto para móviles y evita almacenamiento central o dependencia de servidores.

