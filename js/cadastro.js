const firebaseConfig = {
    apiKey: "AIzaSyDAe_iRhJNdx4_7FerqCQVDnkSORifNOiQ",
      authDomain: "aula-gti17.firebaseapp.com",
      projectId: "aula-gti17",
      storageBucket: "aula-gti17.appspot.com",
      messagingSenderId: "397977998636",
      appId: "1:397977998636:web:8c8a1a6ea87c14851e0889"
  }

  //Inicializando o Firebase
firebase.initializeApp(firebaseConfig);
//Definindo a URL padrão do site
const urlApp = "http://127.0.0.1:5500";

// Referência para o formulário de cadastro no HTML
const formUsuario = document.getElementById('formUsuario')

// Adicionando um ouvinte para o envio do formulário
formUsuario.addEventListener('submit', async function (event) {
    event.preventDefault()

    // Obtendo os valores dos campos do formulário
    const nome = document.getElementById('nome').value
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value
   

    try {
        // Criando um usuário no Firebase Authentication
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, senha)
        const user = userCredential.user

        // Adicionando informações adicionais do usuário ao Realtime Database
        await firebase.database().ref('usuarios/' + user.uid).set({
            nome,
            email
          
        })

        alert('Usuário cadastrado com sucesso!')

        //Redireciona para a tela de login
        window.location.href = "menu.html";

    } catch (error) {
        // Tratando erros
        const errorCode = error.code
        const errorMessage = error.message
        console.error('Erro ao cadastrar usuário:', errorCode, errorMessage)
        alert(`Erro ao cadastrar usuário: ${errorMessage}`)
    }
})

async function salvaCadastro(cadastro) {
    //obtendo o usuário atual
    let usuarioAtual = firebase.auth().currentUser;
    try {
      await firebase.database().ref("usuarios").push({
        ...cadastro,
        usuarioInclusao: {
          uid: usuarioAtual.uid,
          nome: usuarioAtual.displayName,
        },
      });
      alert("✔ Registro incluído com sucesso!");
    
      //Limpar o formulário
      document.getElementById('formUsuario').reset()
    
    } catch (error) {
      alert(`❌Erro ao salvar: ${error.message}`);
    }
  }

  function verificaLogado() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) { //Contém dados do login?
        //Salvamos o id do usuário localmente
        localStorage.setItem("usuarioId", user.uid);
  
        //Inserindo a imagem do usuário      
        let imagem = document.getElementById("imagemUsuario");
  
        user.photoURL
          ? (imagem.innerHTML += `<img src="${user.photoURL}" title="${user.displayName}" class="img rounded-circle" width="48" />`)
          : (imagem.innerHTML += `<img src="images/pessoa.svg" title="Usuário sem foto" class="img rounded-circle" width="32" />`);
  
      } else {
        localStorage.removeItem("usuarioId"); //Removemos o id salvo
        window.location.href = "index.html"; //direcionamos para o login        
      }
    });
  }

  function logoutFirebase() {
    firebase.auth().signOut()
      .then(function () {
        localStorage.removeItem("usuarioId");
        window.location.href = "index.html";
      })
      .catch(function (error) {
        alert(`Não foi possível efetuar o logout: ${error.message}`);
      });
  }