// Moisés Acevedo Trillos 0222020041
// Estevan David martinez perez 0222120032
// Ronald David Roman Valdes 0222120010
// Alejandro Betancur Barrios 0222120041

let nodos = [];
let nodoSeleccionado = null;
let arcos = [];
let menuVisible = false;
let modoMover = false;

// Recolecta coordenadas de los clicks
function obtenerDatosVertices() {
  const datos = {
    nodos: nodos,
    arcos: arcos
  };
  return JSON.stringify(datos);
}

// Guarda el txt
function guardarDatos() {
  const datos = obtenerDatosVertices();
  const archivo = new Blob([datos], { type: 'text/plain' });

  // Crear un enlace de descarga
  const enlaceDescarga = document.createElement('a');
  enlaceDescarga.href = URL.createObjectURL(archivo);
  enlaceDescarga.download = 'datos_vertices.txt';

  // Simular la descarga
  enlaceDescarga.click();
}

// cargar el modelo txt
function cargarDatos() {
  // nodoSeleccionado = null;
  const archivoEntrada = document.getElementById('archivoEntrada').files[0];
  const lector = new FileReader();

  lector.onload = function (evento) {
    const contenidoArchivo = evento.target.result;
    const datos = JSON.parse(contenidoArchivo);

    // Actualizar las variables nodos y arcos con los datos cargados
    nodos = datos.nodos;
    arcos = datos.arcos;

    // Actualizar las referencias de nodos en los arcos cargados para que funcione la opcion mover despues de cargar un archivo
    for (let i = 0; i < arcos.length; i++) {
      const arco = arcos[i];
      const nodo1 = nodos.find((nodo) => nodo.x === arco.nodo1.x && nodo.y === arco.nodo1.y);
      const nodo2 = nodos.find((nodo) => nodo.x === arco.nodo2.x && nodo.y === arco.nodo2.y);
      if (nodo1 && nodo2) {
        arco.nodo1 = nodo1;
        arco.nodo2 = nodo2;
      }
    }


    // Dibujar los vértices en el lienzo
    const lienzo = document.getElementById('myCanvas');
    const contexto = lienzo.getContext('2d');
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    dibujarArcos(contexto, arcos);
    dibujarNodos(contexto, nodos);
  };

  lector.readAsText(archivoEntrada);
}

// Función para obtener el nodo en una posición específica
function obtenerNodoEn(x, y, nodos) {
  for (let indice = 0; indice < nodos.length; indice++) {
    const nodo = nodos[indice];
    const a = x - nodo.x;
    const b = y - nodo.y;

    const c = Math.sqrt(a * a + b * b);

    if (c < 50) { // Rango en el que no se puede pulsar para dibujar un nodo
      return nodo;
    }
  }
  return null;
}

// Función para dibujar los nodos en el lienzo
function dibujarNodos(contexto, nodos) {
  for (let indice = 0; indice < nodos.length; indice++) {
    const nodo = nodos[indice];

    if (nodo === nodoSeleccionado) {
      contexto.strokeStyle = '#DA0037'; // Color de trazo para el nodo seleccionado
      contexto.fillStyle = '#DA0037'; // Color de relleno para el nodo seleccionado
    } else if (nodo.esFuente) {
      contexto.strokeStyle = '#0D63A5'; // Color de trazo para los nodos fuente
      contexto.fillStyle = '#0D63A5'; // Color de relleno para los nodos fuente
    } else if (nodo.esSumidero) {
        contexto.strokeStyle = '#0D63A5'; // Color de trazo para los nodos fuente
        contexto.fillStyle = '#0D63A5'; // Color de relleno para los nodos fuente
    } else {
      contexto.strokeStyle = '#FFD700'; // Color de trazo para los demás nodos
      contexto.fillStyle = '#FFD700'; // Color de relleno para los demás nodos
    }

    contexto.beginPath();
    contexto.lineWidth = 3;
    contexto.arc(nodo.x, nodo.y, 20, 0, 2 * Math.PI);
    contexto.stroke();
    contexto.fill();

    if (nodo === nodoSeleccionado || nodo.esFuente) {
      contexto.fillStyle = '#F8F1F1'; // Color de texto para el nodo seleccionado o fuente
    } else {
      contexto.fillStyle = '#000000'; // Color de texto para los demás nodos
    }

    contexto.font = '30px Maple Mono NF';
    let textWidth = contexto.measureText(indice + 1).width;
    contexto.fillText(indice + 1, nodo.x - textWidth / 2, nodo.y + 10);
  }
}

function dibujarArcos(contexto, arcos) {

  // Dibujar el contorno negro alrededor del peso
  contexto.lineWidth = 3; // ancho del arco
  contexto.fillStyle = '#ffffff'; // Color de texto para el peso (blanco)    
  contexto.font = '20px Maple Mono NF';

  const lineWidthAnterior = contexto.lineWidth;

  for (let indice = 0; indice < arcos.length; indice++) {
    const arco = arcos[indice];
    const inicioX = arco.nodo1.x;
    const inicioY = arco.nodo1.y;
    const finX = arco.nodo2.x;
    const finY = arco.nodo2.y;

    // Calcular el ángulo entre los nodos
    const angulo = Math.atan2(finY - inicioY, finX - inicioX);

    // Calcular las coordenadas de la punta de la flecha
    const puntaX = finX - Math.cos(angulo) * 20;
    const puntaY = finY - Math.sin(angulo) * 20;

    contexto.beginPath();
    contexto.moveTo(inicioX, inicioY);
    contexto.lineTo(finX, finY);
    contexto.strokeStyle = '#FFFFFF'; // Color de trazo para los arcos
    contexto.stroke();

    // Dibujar la flecha en la punta del arco
    contexto.save();
    contexto.translate(puntaX, puntaY);
    contexto.rotate(angulo);

    contexto.beginPath();
    contexto.moveTo(0, 0);
    contexto.lineTo(-10, 5);
    contexto.lineTo(-10, -5);
    contexto.closePath();
    contexto.fillStyle = '#FFFFFF'; // Color de relleno para la flecha
    contexto.fill();

    contexto.restore();

    
    // Dibujar el contorno negro alrededor del peso
    contexto.lineWidth = 25; // Tamaño del contorno del valor del peso
    contexto.strokeStyle = '#1A1A1B'; // Color del contorno negro
    contexto.strokeText(arco.peso, (inicioX + finX) / 2, (inicioY + finY) / 2);
    contexto.fillText(arco.peso, (inicioX + finX) / 2, (inicioY + finY) / 2);
    contexto.lineWidth = lineWidthAnterior;   // Restablecer el valor de lineWidth al anterior
  }
}


window.onload = async () => {
  var lienzo = document.getElementById('myCanvas');
  var contexto = lienzo.getContext('2d');

  const moverNodoBtn = document.getElementById('moverNodoBtn');
  let moverNodoActivo = false;

  moverNodoBtn.addEventListener('click', () => {
    moverNodoActivo = !moverNodoActivo;
    if (moverNodoActivo) {
      moverNodoBtn.classList.add('active');
    } else {
      moverNodoBtn.classList.remove('active');
    }
  });
  
  
//////// agregando el codigo mio
  
  const eliminarNodoBtn = document.getElementById('eliminarNodoBtn');
  let eliminarNodoActivo = false;

  eliminarNodoBtn.addEventListener('click', () => {
    eliminarNodoActivo = !eliminarNodoActivo;
    if (eliminarNodoActivo) {
      eliminarNodoBtn.classList.add('active');
    } else {
      eliminarNodoBtn.classList.remove('active');
    }
  });

  const eliminarNodo = (nodo) => {
    const indiceNodo = nodos.indexOf(nodo);
    if (indiceNodo !== -1) {
      nodos.splice(indiceNodo, 1); // Eliminar el nodo del array nodos
    }
    // Eliminar los arcos asociados al nodo
    arcos = arcos.filter((arco) => {
      return arco.nodo1 !== nodo && arco.nodo2 !== nodo;
    });
  };

  lienzo.addEventListener('mousedown', (e) => {
    if (moverNodoActivo && nodoSeleccionado !== null) {
      const x = e.clientX - lienzo.offsetLeft;
      const y = e.clientY - lienzo.offsetTop;

      lienzo.addEventListener('mousemove', onMouseMove);
      lienzo.addEventListener('mouseup', onMouseUp);

      function onMouseMove(e) {
        const newX = e.clientX - lienzo.offsetLeft;
        const newY = e.clientY - lienzo.offsetTop;
        nodoSeleccionado.x = newX;
        nodoSeleccionado.y = newY;
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        dibujarArcos(contexto, arcos);
        dibujarNodos(contexto, nodos);
      }

      function onMouseUp() {
        lienzo.removeEventListener('mousemove', onMouseMove);
        lienzo.removeEventListener('mouseup', onMouseUp);
      }
    }
    
    //agregando mas
    
        if (eliminarNodoActivo && nodoSeleccionado !== null) {
      const x = e.clientX - lienzo.offsetLeft;
      const y = e.clientY - lienzo.offsetTop;

      const nodoTemporal = obtenerNodoEn(x, y, nodos);

      if (nodoTemporal !== null && nodoTemporal === nodoSeleccionado) {
        eliminarNodo(nodoSeleccionado);
        nodoSeleccionado = null;
        contexto.clearRect(0, 0, lienzo.width, lienzo.height);
        dibujarArcos(contexto, arcos);
        dibujarNodos(contexto, nodos);
      }
    }
    
    ///ok puedo elliminar los nodos y para ello debo seleccionar el nodo y dar clic, pero puedes desactivar la funci
    
  });
  //BIEN
///elininando eliminara contextual del menu
  
  lienzo.addEventListener('contextmenu', (e) => {
  e.preventDefault(); // Evitar que aparezca el menú contextual por defecto
  
  let x = e.clientX - lienzo.offsetLeft;
  let y = e.clientY - lienzo.offsetTop;

  let nodoTemporal = obtenerNodoEn(x, y, nodos);

  if (nodoTemporal !== null) {
    const menu = document.createElement('div');

    menu.id = 'contextMenu';
    menu.style.position = 'absolute';
    menu.style.left = `${e.clientX}px`;
    menu.style.top = `${e.clientY}px`;
    menu.style.background = '#FFFFFF';
    menu.style.border = '1px solid #CCCCCC';
    menu.style.padding = '5px';

    const opcion = document.createElement('div');
    opcion.innerHTML = 'Fuente';
    opcion.style.cursor = 'pointer';

    opcion.addEventListener('click', () => {
      nodoTemporal.esFuente = true;
      nodoTemporal.esSumidero = false; // Establecer el nodo como no sumidero
      dibujarNodos(contexto, nodos);
      // Cerrar el menú contextual
      document.body.removeChild(menu);
    });

    const opcionSumidero = document.createElement('div');
    opcionSumidero.innerHTML = 'Sumidero';
    opcionSumidero.style.cursor = 'pointer';

    opcionSumidero.addEventListener('click', () => {
      nodoTemporal.esFuente = false; // Establecer el nodo como no fuente
      nodoTemporal.esSumidero = true; 
      dibujarNodos(contexto, nodos);
      // Cerrar el menú contextual
      document.body.removeChild(menu);
    });

    const opcionNormal = document.createElement('div');
    opcionNormal.innerHTML = 'Normal';
    opcionNormal.style.cursor = 'pointer';

    opcionNormal.addEventListener('click', () => {
      nodoTemporal.esFuente = false; // Establecer el nodo como no fuente
      nodoTemporal.esSumidero = false; // Establecer el nodo como no sumidero
      dibujarNodos(contexto, nodos);
      // Cerrar el menú contextual
      document.body.removeChild(menu);
    });

    menu.appendChild(opcionSumidero);
    menu.appendChild(opcionNormal);
    menu.appendChild(opcion);
    document.body.appendChild(menu);

    // Manejar el clic fuera del menú contextual para ocultarlo
    const cerrarMenu = (event) => {
      if (!menu.contains(event.target)) {
        document.body.removeChild(menu);
        document.removeEventListener('click', cerrarMenu);
      }
    };

    document.addEventListener('click', cerrarMenu);
  }
});

/// ahora tengon un problema de doble clic 

  lienzo.addEventListener('click', (e) => {
    let x = e.clientX - lienzo.offsetLeft;
    let y = e.clientY - lienzo.offsetTop;

    let nodoTemporal = obtenerNodoEn(x, y, nodos);
    
    
     if (eliminarNodoActivo && nodoTemporal !== null) {
    eliminarNodo(nodoTemporal);
    nodoSeleccionado = null;
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    dibujarArcos(contexto, arcos);
    dibujarNodos(contexto, nodos);
    return;
  }
    if (eliminarNodoActivo) {
    return; // Evitar que se dibujen nodos al hacer clic izquierdo
  }
    
    if (nodoSeleccionado !== null && nodoTemporal === null) {
      nodoSeleccionado = nodoTemporal;
      nodoTemporal = null;
    }

    if (nodoSeleccionado === null) {
      nodoSeleccionado = nodoTemporal;
      nodoTemporal = null;
    }

    if (nodoSeleccionado === null) {
      nodos.push({ x, y });
    }

    contexto.clearRect(0, 0, lienzo.width, lienzo.height);

    if (nodoSeleccionado !== null && nodoTemporal !== null) {
      const existeArco = arcos.some((arco) => {
        return (
          (arco.nodo1 === nodoSeleccionado && arco.nodo2 === nodoTemporal) ||
          (arco.nodo1 === nodoTemporal && arco.nodo2 === nodoSeleccionado)
          );
      });

      const nodosIguales = nodoSeleccionado === nodoTemporal;

      if (!existeArco && !nodosIguales) {
        const peso = prompt('Ingrese el peso del arco:');
        arcos.push({ nodo1: nodoSeleccionado, nodo2: nodoTemporal, peso: parseInt(peso) });
      }
      nodoSeleccionado = null;
      nodoTemporal = null;
    }
    dibujarArcos(contexto, arcos);
    dibujarNodos(contexto, nodos);
  });
};

function actualizarPagina() {
  location.reload();
}

function editarPesoArco() {
  const arcoSeleccionado = prompt('Ingrese la conexión del arco (nodo1-nodo2):');
  const peso = prompt('Ingrese el nuevo peso del arco:');
  

  const nodosConectados = arcoSeleccionado.split('-');
  const nodo1Index = parseInt(nodosConectados[0]) - 1;
  const nodo2Index = parseInt(nodosConectados[1]) - 1;

  const arco = arcos.find((arco) => {
    return (
      (arco.nodo1 === nodos[nodo1Index] && arco.nodo2 === nodos[nodo2Index]) ||
      (arco.nodo1 === nodos[nodo2Index] && arco.nodo2 === nodos[nodo1Index])
    );
  });
  if (arco) {
    arco.peso = parseInt(peso);

    const lienzo = document.getElementById('myCanvas');
    const contexto = lienzo.getContext('2d');
    contexto.clearRect(0, 0, lienzo.width, lienzo.height);
    dibujarArcos(contexto, arcos);
    dibujarNodos(contexto, nodos);
  }
}

function eliminarArco() {
  const conexion = prompt('Ingrese la conexión a eliminar (por ejemplo, "1-2"):');
  const [nodo1, nodo2] = conexion.split('-');

  arcos = arcos.filter((arco) => {
    return !(arco.nodo1 === nodos[nodo1 - 1] && arco.nodo2 === nodos[nodo2 - 1]) &&
      !(arco.nodo1 === nodos[nodo2 - 1] && arco.nodo2 === nodos[nodo1 - 1]);
  });

  const lienzo = document.getElementById('myCanvas');
  const contexto = lienzo.getContext('2d');
  contexto.clearRect(0, 0, lienzo.width, lienzo.height);
  dibujarArcos(contexto, arcos);
  dibujarNodos(contexto, nodos);
}

function cerrarPagina() {
  window.close();
}
