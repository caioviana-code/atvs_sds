// Obtém uma referência ao botão "Editar" na modal.
const btnEditarUsuario = document.getElementById('btnEditarUsuario');
// Obtém uma referência ao elemento da tabela onde os personagens serão exibidos.
const corpoTabelaPersonagens = document.getElementById('corpoTabelaPersonagens');
// Obtém uma referência ao botão que chama a API.
const botaoChamarAPI = document.getElementById('botaoChamarAPI');

// Adiciona um ouvinte de evento para o clique no botão.
botaoChamarAPI.addEventListener('click', () => {
    // Quando o botão é clicado, chama a função para buscar dados e preencher a tabela.
    buscarDadosEPreencherTabela();

});

const botaoDDOS = document.getElementById('botaoDDOS');

// Adiciona um ouvinte de evento para o clique no botão.
botaoDDOS.addEventListener('click', () => {
    // Quando o botão é clicado, chama a função para buscar dados e preencher a tabela.
    inserirMuitosUsuarios();

});

// Adicionar evento de clique para os botões "Excluir"
document.addEventListener('click', function (event) {
    // Verifica se ocorreu um evento de clique (event.target existe) e
    // se o elemento clicado tem a classe 'btn-delete'.
    if (event.target && event.target.classList.contains('btn-delete')) {
        // Aqui estamos pegando o ID do usuário do atributo data-id da tabela
        const idUsuario = event.target.dataset.id;
        deletarUsuario(idUsuario); // Chamamos a função para excluir o usuário com base no ID
    }
});

// Função para inserir muitos usuários em um loop
function inserirMuitosUsuarios() {
    // Número de usuários a serem inseridos
    const numeroDeUsuarios = 100; // Altere para a quantidade desejada

    // Loop para inserir os usuários
    for (let i = 0; i < numeroDeUsuarios; i++) {
        const nome = `Usuario${i}`;
        const email = `usuario${i}@exemplo.com`;
        const disciplina = `Disciplina${i}`;
        const senha = 'senha123'; // Senha padrão, você pode alterar conforme necessário

        // Chama a função para cadastrar o usuário
        cadastrarUsuario(nome, email, disciplina, senha);
    }
}



// Capturar o clique de envio do formulário
document.querySelector('#btnCadastrarUsuario').addEventListener('click', function () {

    // Capturando os valores dos campos do formulário usando os IDs
    const nome = document.querySelector('#nome').value;
    const email = document.querySelector('#email').value;
    const disciplina = document.querySelector('#disciplina').value;
    const senha = document.querySelector('#senha').value;

    // Chamar a função para cadastrar o usuário
    cadastrarUsuario(nome, email, disciplina, senha);

});



// Função que busca os dados da API e preenche a tabela com os usuarios.

function buscarDadosEPreencherTabela() {
    // Faz uma requisição GET para a API.
    axios.get('http://infopguaifpr.com.br:3052/listarTodosUsuarios')
        .then(response => {
            console.log(response.data.usuarios)

            // Obtém a lista de usuários da resposta.
            const usuarios = response.data.usuarios;

            // Chama a função para preencher a tabela com os usuários.
            preencherTabela(usuarios);
        })
        .catch(error => {
            // Em caso de erro, exibe uma mensagem de erro no console.
            console.error('Error fetching character data:', error);
        });
}

// Função para cadastrar um usuário
function cadastrarUsuario(nome, email, disciplina, senha) {
    //Console pra debugar e ver se está pegando
    console.log('Dados capturados para cadastro:');
    console.log('Nome:', nome);
    console.log('Email:', email);
    console.log('Disciplina:', disciplina);
    console.log('Senha:', senha);

    //Criano o objeto novoUsuario e passando os valores armazenados
    const novoUsuario = {
        nome: nome,
        email: email,
        disciplina: disciplina,
        senha: senha
    };

    //Chamando a rota cadastrarUsuario e passando os dados que estão no objeto novoUsuario
    axios.post('http://infopguaifpr.com.br:3052/cadastrarUsuario', novoUsuario, {
            headers: {
                //Cabeçalho dizendo que quero enviar em formato json
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            // Aqui você pode tratar a resposta da requisição, se necessário.
            console.log('Usuário cadastrado com sucesso:', response.data);

            // Fechar a modal após cadastrar o usuário 
            $('#cadastrarUsuario').modal('hide');

            //Exibe o alerta
            //alert('Usuario cadastrado com sucesso')
            //Preenche a tabela com o novo usuario
            buscarDadosEPreencherTabela()
        })
        .catch(error => {
            // alert('Erro ao cadastrar usuário:', error)
        });
}

// Função para excluir um usuário com base no ID.
function deletarUsuario(idUsuario) {
    // Faz uma requisição DELETE para a API passando o ID do usuário.
    axios.delete(`http://infopguaifpr.com.br:3052/deletarUsuario/${idUsuario}`)
        .then(response => {
            console.log('Usuario excluido com suceso')
            // Atualiza a tabela após a exclusão.
            alert('Usuario excluido com sucesso')
            buscarDadosEPreencherTabela()
        })
        .catch(error => {
            console.error('Erro ao deletar:', error);
        });
}


// Função que preenche a tabela com os dados dos usuários.
function preencherTabela(usuarios) {
    // Para cada usuário na lista...
    usuarios.forEach(usuario => {
        // Cria uma nova linha na tabela.
        const linha = document.createElement('tr');

        // Cria células para cada dado do usuário e insere o texto.
        const idCelula = document.createElement('td');
        idCelula.textContent = usuario.id;
        linha.appendChild(idCelula);

        // Cria células para cada dado do usuário e insere o texto.
        const nomeCelula = document.createElement('td');
        nomeCelula.textContent = usuario.nome;
        linha.appendChild(nomeCelula);

        const emailCelula = document.createElement('td');
        emailCelula.textContent = usuario.email;
        linha.appendChild(emailCelula);

        const disciplinaCelula = document.createElement('td');
        disciplinaCelula.textContent = usuario.disciplina;
        linha.appendChild(disciplinaCelula);

        // Cria células para os botões de editar e excluir.
        const acoesCelula = document.createElement('td');

        //botão de edição
        const editarBotao = document.createElement('a');
        editarBotao.href = '#';
        editarBotao.className = 'btn btn-primary btn-edit';
        editarBotao.textContent = 'Editar';
        editarBotao.dataset.id = usuario.id;
        editarBotao.dataset.toggle = 'modal';
        editarBotao.dataset.target = '#editarUsuario';
        //Adicionado um event listener pra chamar a função abrirModal
        editarBotao.addEventListener('click', function () {
            const idUsuario = editarBotao.dataset.id;
            abrirModalEdicao(idUsuario);
        });

        acoesCelula.appendChild(editarBotao);

        //botao de exclusão
        const excluirBotao = document.createElement('a');
        excluirBotao.href = '#';
        excluirBotao.className = 'btn btn-danger btn-delete';
        excluirBotao.textContent = 'Excluir';
        excluirBotao.dataset.id = usuario.id; // AQUI O BOTÃO VAI PEGAR O ID USUARIO
        acoesCelula.appendChild(excluirBotao);

        linha.appendChild(acoesCelula);

        // Adiciona a linha preenchida à tabela.
        corpoTabelaPersonagens.appendChild(linha);
    });
}


// Função para abrir o modal de edição
function abrirModalEdicao(idUsuario) {

    const modalEditar = document.getElementById('editarUsuario');
    modalEditar.style.display = 'block';

    console.log('ID do usuário:', idUsuario);



    // Realiza a requisição GET para obter as informações do usuário
    axios.get(`http://infopguaifpr.com.br:3052/pegarUsuarioPeloId/${idUsuario}`)
        .then(response => {

            const usuario = response.data.usuario;
            const iddoUsuario = response.data.usuario.id;

            console.log('ID do usuário:', iddoUsuario);

            console.log('Dados do usuário:', usuario);

            // Preenche os campos do modal com os dados do usuário
            const nomeInput = document.querySelector('#nomeInput');
            const emailInput = document.querySelector('#emailInput');
            const disciplinaInput = document.querySelector('#disciplinaInput');

            if (usuario) {
                nomeInput.value = usuario.nome;
                emailInput.value = usuario.email;
                disciplinaInput.value = usuario.disciplina;
            }


        })
        .catch(error => {
            console.error('Erro ao obter dados do usuário:', error);
        });
}


function atualizarUsuario(idUsuario, nome, email, disciplina) {
    // Cria o objeto com os dados atualizados do usuário.
    const usuarioAtualizado = {
        nome: nome,
        email: email,
        disciplina: disciplina
    };

    // Faz a requisição PUT para a rota de atualização.
    axios.put(`http://infopguaifpr.com.br:3052/atualizarUsuario/${idUsuario}`, usuarioAtualizado)
        .then(response => {
            console.log('Usuário atualizado com sucesso:', response.data);

            // Fecha a modal após a atualização.
            $('#editarUsuario').modal('hide');

            // Atualiza a tabela.
            buscarDadosEPreencherTabela();
        })
        .catch(error => {
            console.error('Erro ao atualizar usuário:', error);
        });
}

// Adiciona um ouvinte de evento de clique ao botão "Editar".
btnEditarUsuario.addEventListener('click', function () {
    // Obtém os valores dos campos de entrada na modal.
    const nome = document.querySelector('#nomeInput').value;
    const email = document.querySelector('#emailInput').value;
    const disciplina = document.querySelector('#disciplinaInput').value;

    // Chama a função para atualizar o usuário.
    atualizarUsuario(iddoUsuario, nome, email, disciplina);
});