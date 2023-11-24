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

function logaGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      window.location.href = "menu.html";
    }).catch((error) => {
      alert(`Erro ao efetuar o login: ${error.message}`)
    })
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

async function salvaPrestador(prestador) {
  //obtendo o usuário atual
  let usuarioAtual = firebase.auth().currentUser;
  try {
    await firebase.database().ref("pacientes").push({
      ...prestador,
      usuarioInclusao: {
        uid: usuarioAtual.uid,
        nome: usuarioAtual.displayName,
      },
    });
    alert("✔ Registro incluído com sucesso!");
  
    //Limpar o formulário
    document.getElementById('formCadastro').reset()
  
  } catch (error) {
    alert(`❌Erro ao salvar: ${error.message}`);
  }
}
//evento submit do formulário
document.getElementById("formCadastro").addEventListener("submit", function (event) {
  event.preventDefault(); // evita o recarregamento
  const prestador = {
    nome: document.getElementById("nome").value,
    email: document.getElementById("email").value,
    sangue: document.getElementById("sangue").value,
    sexo: document.querySelector('input[name="sexo"]:checked').value,
    idade: document.getElementById("idade").value,
    cep: document.getElementById("cep").value,
    endereco: document.getElementById("endereco").value,
  };
  salvaPrestador(prestador);
});

async function carregaPacientes(){
  const tabela = document.getElementById('dadosTabela')
  const usuarioAtual = localStorage.getItem('usuarioId')

  await firebase.database().ref('pacientes').orderByChild('nome')
  .on('value',(snapshot) => {
    //Limpamos a tabela
    tabela.innerHTML = ``
    if(!snapshot.exists()) { //não existe o snapshot?
      tabela.innerHTML = `<tr class='table-danger'><td colspan='7'>Ainda não existe nenhum registro cadastrado.</td></tr>`
    } else { //se existir o snapshot, montamos a tabela
      snapshot.forEach(item => {
        const dados = item.val() // obtém os dados
        const id = item.key // obtém o id
        
        const isUsuarioAtual = (dados.usuarioInclusao.uid === usuarioAtual)
        const botao = isUsuarioAtual
        ? `<button class='btn btn-sm btn-danger' onclick='removePrestador("${id}")'
           title='Excluir o registro atual'>🗑 Excluir</button>`
        : `🚫Indisponível`   

        tabela.innerHTML += `
        <tr>
           <td>${dados.nome}</td>
           <td>${dados.email}</td>
           <td>${dados.sangue}</td>
           <td>${dados.sexo}</td> 
           <td>${dados.idade}</td>
           <td>${dados.cep}</td>
           <td>${dados.endereco}</td>
           <td>${botao}</td>
        </tr>
        `;
      })
    }
  })
}

async function removePrestador(id){
  if(confirm('Deseja realmente excluir o prestador?')){
    const prestadorRef = await firebase.database().ref('pacientes/'+id)

    //Remova o prestador do Firebase
    prestadorRef.remove()
    .then(function(){
      alert('Prestador excluído com sucesso!')
    })
    .catch(function(error){
      alert(`Erro ao excluir o prestador: ${error.message}. Tente novamente`)
    })
  }
}

  //Login 2

  function validaLogin() { formUsuario.addEventListener('submit', async function (event) {
    event.preventDefault()

    // Obtendo os valores dos campos
    const email = document.getElementById('email').value
    const senha = document.getElementById('senha').value

    try {
        // Autenticando no Firebase
        await firebase.auth().signInWithEmailAndPassword(email, senha)
        alert('Usuário logado!')
        window.location.href = 'menu.html'

    } catch (error) {
        // Tratando erros
        const errorCode = error.code
        const errorMessage = error.message
        console.error('Erro ao realizar login:', errorCode, errorMessage)
        alert(`Erro ao realizar login: Verifique o email e a senha`)
    }
})
  }