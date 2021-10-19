import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './Cobranca.module.scss';

import { AddModal } from './AddModal/AddModal';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import { IItemAddResult } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

function Cobranca () {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [listDataClient, setListDataClient] = useState<IDataClient[]>(null);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: 'Finalizado',
  });

  useEffect(() => {
    loadData();
  })

  const loadData = async () => {
    const allItems: any[] = await sp.web.lists.getByTitle("Cobranças").items.get();
    const dataClient = allItems.map(item => item)
    setListDataClient(dataClient);
  }

  const loading = listDataClient === null;

  const addClient = async () => {
    const registered: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add(client);
    console.log(registered);
  }

  const getDataForm = (e) => {
    const el: HTMLInputElement = e.target.value
    if(el.id == 'nameClient') setClient({...client, Title: el.value});
    if(el.id == 'description') setClient({...client, Motivo: el.value});
  }
  
  const handleModal = (e: any) => {
    e.preventDefault(); 
    setShowAddModal(!showAddModal);
  }
  
  const renderClient = () => (
    listDataClient ? listDataClient.map(dataClient => (
      <tr>
        <td>{dataClient.Title}</td>
        <td>{dataClient.Motivo}</td>
        <td>{dataClient.situacao}</td>
      </tr>
    )) : []
  )
  
  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Detalhes do contato</h3>
        <div>
          <img src="http://cdn.onlinewebfonts.com/svg/img_81837.png" className={styles.iconAdmin} />
          <span>Administrador</span>
        </div>
      </header>
      <div className={styles.navigation}>
        <div>
          <p>Painel de contatos</p>
        </div>
        <div>
          <button>Mes</button>
        </div>
      </div>
      <main>
        <div className={styles.category}>
          <a href="#" onClick={(e) => handleModal(e)}>Adicionar</a>
          <a href="#">Editar</a>
          <a href="#">Excluir</a>
          <a href="#">Lorem</a>
        </div>
        <section className={styles.dataBox}>
        </section>
        <div className={styles.infoHeader}>
          <h2>Histórico de clientes</h2>
          <div>
            <input className={styles.inputSearchClient} type="text" placeholder="Pesquisar por cliente" />
            <button>Últimos clientes</button>
          </div>
        </div>
        <table>
          <tr>
            <th>Nome do cliente</th>
            <th>Data e hora do envio</th>
            <th>Motivo do contato</th>
            <th>Situação</th>
          </tr>
          { loading == null ? <div className={styles.loading}></div> : renderClient() }
        </table>
        { showAddModal ? < AddModal handleAddModal={handleModal} addClient={addClient} getDataForm={getDataForm} dataClient={client}/> : showAddModal }
      </main>
    </div>
  )
}

export default Cobranca;