// ─── DADOS DOS PARTICIPANTES ─────────────────────────────────
// Adicione ou remova participantes aqui
const participantes = [
  "Afonso de Lima Dutra",
  "Albina Gimenez Larrea",
  "Antonia Gonçalves dos Santos",
  "Antonio Sandoval",
  "Arquimedes Henriques",
  "Beatriz Meza Vda",
  "Carolina Camus Torres",
  "Edeltrudes das Coxa",
  "Elisa Marques Sousa",
  "Elza Pereira da Gama",
  "Enilda Dutra",
  "Eunidia Ramires",
  "Fulvia Leonida Martines",
  "Izabel Dutra",
  "Jacob Germano Horst",
  "Jeronimo Ramirez",
  "Joana Gamarra",
  "Joaquim F. dos Santos",
  "José Cinuncião Aspet",
  "Livrada Medina Recalde",
  "Lurdes M. Beleude",
  "Manoela Soares Rodrigues",
  "Maria Aparecida",
  "Maria Aparecida D. S. Almeida",
  "Maria Elena Batista de Jesus",
  "Maria Inez Varéas",
  "Maria J. M. Carvalan",
  "Maria Vitória Barbosa Silveira",
  "Mariana Janu Nieldemayer",
  "Marilda Nunes dos Santos",
  "Maura Tereza Alvarenga",
  "Merarda Gimenez Bogado",
  "Neila Montiel Carvalho",
  "Olga Vielman de Henriquez",
  "Orcanda Vargal",
  "Petrona Mendonça",
  "Ramão Adolfo Camargo",
  "Ramão Rodriges",
  "Reinalda Martinez P.",
  "Santina Camelli",
  "Sueli Fatima Pazalli",
  "Teresa Jesus Alegre",
  "Vair Roque Ramirez",
  "Veronica da Rosa Correia",
  "Vilma Barbosa"
];

// ─── GERAÇÃO DE IDs FIXOS (baseados no nome) ─────────────────
function gerarId(nome) {
  let hash = 0;
  for (let i = 0; i < nome.length; i++) {
    hash = ((hash << 5) - hash) + nome.charCodeAt(i);
    hash |= 0;
  }
  return 'UNAPI-' + Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
}

// ─── RENDERIZAR LISTA DE QR CODES ────────────────────────────
function renderizarQRCodes() {
  const lista = document.getElementById('lista-qr');
  lista.innerHTML = '';

  participantes.forEach(nome => {
    const id = gerarId(nome);
    const card = document.createElement('div');
    card.className = 'participante-card';
    
    // Usar QR Server API para gerar QR codes
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=72x72&data=${encodeURIComponent(id)}&color=1a5c3a&bgcolor=ffffff`;
    
    card.innerHTML = `
      <div class="qr-mini">
        <img src="${qrImageUrl}" alt="QR Code ${id}" style="width: 72px; height: 72px; border-radius: 4px;" loading="lazy" />
      </div>
      <div class="part-info">
        <div class="nome">${nome}</div>
        <div class="id">${id}</div>
      </div>`;
    lista.appendChild(card);
  });
}

// Função para copiar ID para a área de transferência
function copiarID(id) {
  navigator.clipboard.writeText(id).then(() => {
    alert('ID copiado: ' + id);
  }).catch(err => {
    console.error('Erro ao copiar:', err);
    prompt('Copie este ID:', id);
  });
}

// ─── CÂMERA E LEITURA DE QR ───────────────────────────────────
let lendo = false;
let stream = null;
let qrDetectado = null;
let congelado = false;
let tempoRestante = 3;
let ultimoCodigoLido = '';
let ultimoLeitura = 0;

async function iniciarCamera() {
  if (typeof jsQR === 'undefined') {
    mostrarResultado(false, 'Erro: a biblioteca de leitura de QR Code (jsQR.js) não carregou. Verifique se o arquivo jsQR.js está na mesma pasta do site e recarregue a página.');
    console.error('❌ jsQR não está definido — jsQR.js não carregou.');
    return;
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    mostrarResultado(false, 'Este navegador não permite acesso à câmera nesta página (verifique se o site está em HTTPS).');
    console.error('❌ navigator.mediaDevices.getUserMedia indisponível.');
    return;
  }
  try {
    console.log('📹 Iniciando câmera...');
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    const video = document.getElementById('video');
    video.srcObject = stream;
    document.getElementById('btn-iniciar').textContent = '⏹ Parar câmera';
    document.getElementById('btn-iniciar').onclick = pararCamera;
    lendo = true;
    congelado = false;
    qrDetectado = null;
    console.log('✅ Câmera ativada');
    mostrarResultado(null, '📷 Câmera iniciada - aponte para o QR Code');
    lerFrame();
  } catch (e) {
    console.error('Erro ao acessar câmera com facingMode "environment":', e);
    // Alguns celulares recusam essa restrição exata. Tenta de novo sem especificar a câmera.
    try {
      console.log('📹 Tentando novamente sem restrição de câmera traseira...');
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.getElementById('video');
      video.srcObject = stream;
      document.getElementById('btn-iniciar').textContent = '⏹ Parar câmera';
      document.getElementById('btn-iniciar').onclick = pararCamera;
      lendo = true;
      congelado = false;
      qrDetectado = null;
      console.log('✅ Câmera ativada (modo alternativo)');
      mostrarResultado(null, '📷 Câmera iniciada - aponte para o QR Code');
      lerFrame();
    } catch (e2) {
      console.error('Erro ao acessar câmera:', e2);
      mostrarResultado(false, 'Câmera não disponível: ' + e2.name + '. Use o campo manual abaixo.');
    }
  }
}

function pararCamera() {
  lendo = false;
  congelado = false;
  qrDetectado = null;
  if (stream) stream.getTracks().forEach(t => t.stop());
  document.getElementById('btn-iniciar').textContent = 'Iniciar câmera';
  document.getElementById('btn-iniciar').onclick = iniciarCamera;
  document.getElementById('btn-confirmar').style.display = 'none';
  document.getElementById('overlay-captura').style.display = 'none';
}

function lerFrame() {
  if (!lendo) return;
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas-hidden');
  const ctx = canvas.getContext('2d');

  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
      const qr = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (qr && qr.data) {
        const codigo = qr.data.trim();
        const agora = Date.now();

        if (
          codigo === ultimoCodigoLido &&
          agora - ultimoLeitura < 3000
        ) {
          requestAnimationFrame(lerFrame);
          return;
        }

        ultimoCodigoLido = codigo;
        ultimoLeitura = agora;

        document.getElementById('id-manual').value = codigo;
        enviarPresenca(codigo);
        pararCamera();
        return;
      }
    } catch (e) {
      console.error('Erro ao processar QR:', e);
    }
  }
  
  if (!congelado) {
    requestAnimationFrame(lerFrame);
  }
}

function congelarCamera(id) {
  congelado = true;
  qrDetectado = id;
  
  // Copiar frame atual para canvas congelado
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas-hidden');
  const canvasCongelado = document.getElementById('canvas-congelado');
  const ctxCongelado = canvasCongelado.getContext('2d');
  
  canvasCongelado.width = canvas.width;
  canvasCongelado.height = canvas.height;
  ctxCongelado.drawImage(canvas, 0, 0);
  canvasCongelado.style.display = 'block';
  document.getElementById('video').style.opacity = '0.3';
  
  // Mostrar overlay com countdown
  const overlay = document.getElementById('overlay-captura');
  overlay.style.display = 'flex';
  document.getElementById('btn-confirmar').style.display = 'block';
  
  // Countdown de 3 segundos
  tempoRestante = 3;
  atualizarContagem();
}

function atualizarContagem() {
  document.getElementById('tempo-restante').textContent = tempoRestante;
  tempoRestante--;
  
  if (tempoRestante >= 0) {
    setTimeout(atualizarContagem, 1000);
  } else {
    // Confirmar automaticamente após 3 segundos
    confirmarLeitura();
  }
}

function confirmarLeitura() {
  if (!qrDetectado) return;
  
  console.log('✅ Leitura confirmada:', qrDetectado);
  
  // Limpar UI
  document.getElementById('overlay-captura').style.display = 'none';
  document.getElementById('btn-confirmar').style.display = 'none';
  document.getElementById('canvas-congelado').style.display = 'none';
  document.getElementById('video').style.opacity = '1';
  
  // Parar câmera e enviar
  pararCamera();
  enviarPresenca(qrDetectado);
}

// ─── ENVIO PARA APPS SCRIPT ───────────────────────────────────
async function enviarPresenca(id) {
  const url = document.getElementById('url-script').value.trim();
  if (!url) {
    mostrarResultado(false, 'Configure a URL do Apps Script primeiro.');
    console.error('URL do Apps Script não configurada');
    return;
  }

  mostrarResultado(null, 'Registrando presença...');
  console.log('📤 Enviando ID:', id);

  try {
    const res = await fetch(url + '?id=' + encodeURIComponent(id));
    
    console.log('📥 Status HTTP:', res.status);
    const dados = await res.json();
    console.log('📥 Resposta:', dados);

    if (dados.sucesso) {
      const mensagemConfirmacao = `✅ Dados enviados para a planilha com sucesso!${dados.nome ? `\nParticipante: ${dados.nome}` : ''}${dados.hora ? `\nHora: ${dados.hora}` : ''}`;
      mostrarResultado(true, dados.nome, dados.hora);
      alert(mensagemConfirmacao);
    } else {
      mostrarResultado(false, dados.mensagem || 'QR Code não reconhecido.');
    }
  } catch (e) {
    console.error('❌ Erro de conexão:', e);
    mostrarResultado(false, 'Erro: ' + e.message + '. Verifique a URL e a internet.');
  }
}

function mostrarResultado(sucesso, msg, hora) {
  const el = document.getElementById('resultado');
  el.style.display = 'block';
  el.className = 'resultado';

  if (sucesso === true) {
    el.classList.add('sucesso');
    el.innerHTML = `<div class="nome">✅ ${msg}</div><div class="hora">Presença registrada às ${hora}</div>`;
    console.log('✅ Sucesso:', msg, hora);
  } else if (sucesso === false) {
    el.classList.add('erro');
    el.innerHTML = `❌ ${msg}`;
    console.error('❌ Erro:', msg);
  } else {
    el.classList.add('erro');
    el.style.background = '#f0f4f8';
    el.style.borderColor = '#c8d8cf';
    el.style.color = '#5a6672';
    el.innerHTML = msg;
    console.log('⏳ Status:', msg);
  }

  if (sucesso !== null) {
    setTimeout(() => {
      el.style.display = 'none';
      el.className = 'resultado';
      el.style.background = '';
      el.style.borderColor = '';
      el.style.color = '';
    }, 4000);
  }
}

function enviarPresencaManual() {
  const id = document.getElementById('id-manual').value.trim().toUpperCase();
  if (!id || !id.startsWith('UNAPI-')) {
    mostrarResultado(false, 'ID inválido. Digite no formato UNAPI-XXXXXX');
    return;
  }
  enviarPresenca(id);
  document.getElementById('id-manual').value = '';
}

// ─── ABAS ─────────────────────────────────────────────────────
function trocarAba(aba, btn) {
  document.querySelectorAll('.pagina').forEach(p => p.classList.remove('ativa'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('ativo'));
  document.getElementById('pagina-' + aba).classList.add('ativa');
  btn.classList.add('ativo');
}

// ─── EXPORTAÇÃO DE DADOS ──────────────────────────────────────
function baixarArquivoTexto(conteudo, nomeArquivo) {
  // Tenta primeiro usando data: URI em nova aba (funciona em arquivo local)
  const dataUri = 'data:text/plain;charset=utf-8,' + encodeURIComponent(conteudo);
  const novaAba = window.open(dataUri, '_blank');
  
  // Se a nova aba falhar, tenta criar um blob e fazer download
  if (!novaAba) {
    try {
      const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch(e) {
      console.error('Erro ao baixar:', e);
    }
  }
}

function exportarCodigosQR() {
  mostrarResultado(null, 'Preparando download dos QR Codes...', null);
  let downloadados = 0;
  let erros = 0;
  
  participantes.forEach((nome, index) => {
    const id = gerarId(nome);
    const nomeArquivo = id + '_' + nome.replace(/[^a-zA-Z0-9]/g, '_') + '.png';
    const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(id) + '&color=1a5c3a&bgcolor=ffffff';
    
    setTimeout(() => {
      fetch(qrImageUrl)
        .then(res => res.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = nomeArquivo;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 100);
          
          downloadados++;
          if (downloadados + erros === participantes.length) {
            if (erros === 0) {
              mostrarResultado(true, 'Todos os ' + participantes.length + ' QR Codes baixados!', new Date().toLocaleTimeString());
            } else {
              mostrarResultado(true, downloadados + ' QR Codes, ' + erros + ' erros', new Date().toLocaleTimeString());
            }
          }
        })
        .catch(err => {
          console.error('❌ Erro ao baixar:', err);
          erros++;
          if (downloadados + erros === participantes.length) {
            mostrarResultado(false, 'Erro ao baixar alguns QR Codes', null);
          }
        });
    }, index * 200);
  });
}

function exportarListaCodigos() {
  let conteudo = 'LISTA DE CÓDIGOS QR - UnAPI Presença\n';
  conteudo += '='.repeat(50) + '\n\n';
  
  participantes.forEach((nome) => {
    const id = gerarId(nome);
    conteudo += id + '\n';
  });
  
  baixarArquivoTexto(conteudo, 'codigos_qr.txt');
  mostrarResultado(true, 'Códigos abertos em nova aba!', new Date().toLocaleTimeString());
}

function exportarListaNomes() {
  let conteudo = 'LISTA DE NOMES - UnAPI Presença\n';
  conteudo += '='.repeat(50) + '\n\n';
  
  participantes.forEach((nome, index) => {
    conteudo += (index + 1) + '. ' + nome + '\n';
  });
  
  baixarArquivoTexto(conteudo, 'lista_nomes.txt');
  mostrarResultado(true, 'Nomes abertos em nova aba!', new Date().toLocaleTimeString());
}

// ─── INIT ─────────────────────────────────────────────────────
renderizarQRCodes();
