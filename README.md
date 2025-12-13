# 🕵️‍♂️ Código Secreto: Party Edition

**Una adaptación digital y moderna del clásico juego de mesa, diseñada para jugar en fiestas con amigos usando solo vuestros móviles.**

🔗 **[JUEGA AHORA AQUÍ](https://codigo-secreto-party.vercel.app)**

---

## 🎮 ¿Qué es esto?

Esta aplicación web permite jugar a "Código Secreto" (Codenames) sin necesidad de tablero físico. Está optimizada para móviles y diseñada para que la tecnología facilite la interacción social, no para que la sustituya.

### ✨ Características Principales
* **Modo Mesa vs. Capitán:** Un dispositivo se queda en el centro como tablero y los capitanes usan otro para ver las claves.
* **🎉 Modo Fiesta:** Incluye retos aleatorios en cada turno (Mimo, Cantar, Dibujar...).
* **🎨 Pizarra Interactiva:** Si sale el reto de dibujo, ¡se abre un lienzo digital sincronizado en tiempo real!
* **💀 Modo Difícil:** Privacidad total. Los capitanes comparten un solo móvil que oculta las claves al cambiar de turno.
* **Conexión Instantánea:** Crea una sala y comparte el enlace por WhatsApp. Sin registros.

---

## 🛠️ Cómo desplegar tu propia versión

Si quieres tener tu propia copia del juego para modificarla o alojarla tú mismo, sigue estos pasos:

### 1. Requisitos Previos
* Tener **Node.js** instalado.
* Una cuenta gratuita en **Firebase** (Google).
* Una cuenta en **GitHub**.

### 2. Instalación Local

1.  **Clona este repositorio:**
    ```bash
    git clone [https://github.com/TU_USUARIO/codigo-secreto-party.git](https://github.com/TU_USUARIO/codigo-secreto-party.git)
    cd codigo-secreto-party
    ```

2.  **Instala las dependencias:**
    ```bash
    npm install
    ```

3.  **Configura Firebase:**
    * Crea un proyecto en [Firebase Console](https://console.firebase.google.com/).
    * Crea una **Realtime Database** y ponla en "Modo de prueba" (Test Mode).
    * Ve a Configuración del Proyecto -> General -> Tus Apps -> Web (`</>`).
    * Copia la configuración (`const firebaseConfig = ...`).
    * Abre el archivo `src/firebase.js` en este proyecto y pega tus claves allí.

4.  **Arranca el servidor:**
    ```bash
    npm run dev
    ```

### 3. Despliegue en Vercel (Recomendado)

La forma más fácil de ponerlo online gratis es usar **Vercel**:

1.  Sube tu código a un repositorio de GitHub.
2.  Ve a [Vercel.com](https://vercel.com) e inicia sesión con GitHub.
3.  Haz clic en **"Add New Project"** e importa tu repositorio.
4.  Vercel detectará que es un proyecto **Vite**. Dale a **Deploy**.
5.  ¡Listo! Ya tienes tu URL pública.

---

## 💻 Tecnologías

* **Frontend:** React + Vite
* **Estilos:** Tailwind CSS
* **Backend/DB:** Firebase Realtime Database