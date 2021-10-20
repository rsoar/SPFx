import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './Cobranca.module.scss';


import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import { IItemAddResult } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { IList } from '@pnp/sp/lists';

function Cobranca (props: ICobrancaProps) {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>(null);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: 'Finalizado',
  });

  useEffect(() => {
    loadData();
  }, [])

  const loadData = async () => {
    const allItemsUser: IDataClient[] = await sp.web.lists.getByTitle('Cobranças').items.get();
    const userAdmin = props.context.pageContext.user;
    setAdminData(userAdmin);
    setListDataClient(allItemsUser);
  }
  
  const addCliente = async () => {
    const newClient: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add({
      Title: client.Title,
      Motivo: client.Motivo,
      situacao: client.situacao
    });
    loadData();
  }

  const deleteClient = async (e: any) => {
    const el = e.target;
    const listItems: IList = await sp.web.lists.getByTitle("Cobranças");
    listItems.items.getById(el.id).delete();
    
    loadData();
  }

  const clientRender = () => (
    listDataClient !== null ? listDataClient.map(dataClient => (
      <tr>
        <td>{dataClient.Title}</td>
        <td>{dataClient.Created}</td>
        <td>{dataClient.Motivo}</td>
        { dataClient.situacao === 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
      </tr>
    )) : []
  );

  const loading = listDataClient === null;
  
  const defineValueInput = (e) => {
    if(e.target.id === 'nameClient') setClient({...client, Title: e.target.value});
    if(e.target.id === 'description') setClient({...client, Motivo: e.target.value});
    if(e.target.id === 'statusClient') setClient({...client, situacao: e.target.value});
  }

  const handleModal = (e: any) => {
    e.preventDefault(); 
    setShowAddModal(!showAddModal);
  }

  const handleDeleteModal = (e: any) => {
    e.preventDefault();
    setDeleteModal(!deleteModal)
  }
  
  
  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Detalhes do contato</h3>
        <div>
          { adminData ? <img className={styles.iconAdmin} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${adminData.email}`} alt="admin-icon" /> : <span>calma</span> }
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
          <a href="#" onClick={handleModal}>Adicionar</a>
          <a href="#">Editar</a>
          <a href="#" onClick={handleDeleteModal}>Excluir</a>
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
          {loading ? <div className={styles.loadbox}><div className={styles.loading}></div></div> : 
          <table>
          <tr>
            <th>Nome do cliente</th>
            <th>Data e hora do envio</th>
            <th>Motivo do contato</th>
            <th>Situação</th>
          </tr>
          {clientRender()}
        </table>
        }
        { deleteModal ? 
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <table>
              <th>Nome do cliente</th>
              <th>Data e hora do envio</th>
              <th>Motivo do contato</th>
              <th>Situação</th>
            </table>
            { listDataClient.map(item => (
              <div className={styles.dataModal}>
                <div>
                  <span>{item.Title}</span>
                  <span>{item.Created}</span>
                  <span>{item.Motivo}</span>
                  <span>{item.situacao}</span>
                </div>
                <button id={`${item.Id}`} onClick={deleteClient}>X</button>
              </div>
            )) }
          </div>
        </div> 
        : deleteModal }
        { showAddModal ? 
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <button onClick={handleModal}>X</button>
            <h1>Adicionar novo cliente</h1>
            <label>Nome Completo do cliente</label>
            <input id="nameClient" type="text" placeholder="Digite o nome completo do cliente" value={client.Title} onChange={defineValueInput} />
            <label htmlFor="">Motivo:</label>
            <input id="description" type="text" placeholder="Motivo do atendimento" value={client.Motivo} onChange={defineValueInput} />
            <select name="statusClient" id="statusClient" onChange={defineValueInput}>
              <option value="Aberto">Em aberto</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <button onClick={addCliente}>Adicionar</button>
          </div>
        </div> : showAddModal }
      </main>
    </div>
  )
}

export default Cobranca;