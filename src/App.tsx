import React, {useEffect, useState} from 'react';
import './App.css';
import {FaArrowCircleLeft, FaArrowCircleRight, FaWindowClose} from 'react-icons/fa';

function App() {
  const api_url = 'http://localhost:3150/movies';
  const [movies, setMovies] = useState([])
  const [editing, setEditing] = useState(0);
  const [title, setTitle] = useState('');
  const [page, setCurrentPage] = useState(1);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState();

  const fetchApi = async (page=0, search = '') => {
    page = page < 0 ? 0 : page;
    setCurrentPage(page);
    setEditing(0)
    const response = await fetch(api_url + '?page=' + page + '&title=' + search)
    const body = await response.json()
    setMovies(body);
  }

  const remove = async (id) => {
    const response = await fetch(api_url + '/' + id, {method: 'DELETE'})
    if(response.ok) {
      fetchApi()
    }
  }

  const edit = async (id) => {
    const response = await fetch(api_url + '/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title})
    })

    if(response.ok) {
      setEditing(0)
      fetchApi(page)
    }
  }

  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const sendImport = () => {
    if (selectedFile === undefined) {
      return;
    }

    const formData = new FormData();

    formData.append('file', selectedFile);

    fetch(
        api_url,
        {
          method: 'POST',
          body: formData,
        }
    )
        .then((result) => {
          setIsOpen(false);
          fetchApi()
        })
        .catch((error) => {
          console.error('Error:', error);
        });
  };

  useEffect(() => {
    fetchApi()
  }, []);

  return (
      <div className="App">
        <div className="header">
          <input id="search" placeholder="Buscar.." onChange={e => fetchApi(page, e.target.value)} autoComplete="off"/>
          <button type="button" id='import' onClick={() => setIsOpen(true)}>Importar películas</button>
        </div>
        <table>
          <thead>
          <tr>
            <th>Nro</th>
            <th>Película</th>
            <th>Acciones</th>
          </tr>
          </thead>
          <tbody>
          {movies.map(( listValue, index ) => {
            return (
                <tr key={index}>
                  <td>{listValue.id}</td>
                  <td>{listValue.id === editing ? <input type="text" onChange={(e) => setTitle(e.target.value)} /> : listValue.title}</td>
                  <td>
                    { listValue.id === editing &&
                        <div>
                          <button type="button" onClick={() => setEditing(0)}>Atrás</button>
                          <button type="button" onClick={() => edit(listValue.id)}>Enviar</button>
                        </div>
                    }
                    { editing === 0 &&
                        <div>
                          <button type="button" onClick={() => setEditing(listValue.id)}>Editar</button>
                          <button type="button" onClick={() => remove(listValue.id)}>Eliminar</button>
                        </div>
                    }
                  </td>
                </tr>
            );
          })}
          </tbody>
        </table>
        <div id="pagination">
          <FaArrowCircleLeft className="icons" onClick={() => fetchApi(page-1)}/>
          <span id="paginator">{page + 1}</span>
          <FaArrowCircleRight className="icons" onClick={() => fetchApi(page+1)}/>
        </div>


        <div className={modalIsOpen ? "modal display-block" : "modal display-none"}>
          <section className="modal-main">

            <a onClick={() => setIsOpen(false)} id="close-button">
              <FaWindowClose />
            </a>

            <h1>Importar películas</h1>

            <label>Seleccione el archivo .csv</label>
            <br/><br/>
            <div>
              <input type="file" onChange={changeHandler}/>
            </div>

            <button type="button" onClick={() => sendImport()} id="sendFile">Enviar</button>
          </section>
        </div>
      </div>
  );
}

export default App;
