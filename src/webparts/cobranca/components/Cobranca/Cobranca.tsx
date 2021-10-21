import * as React from 'react';
import { useState, useEffect } from 'react';
import styles from './Cobranca.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import { IItemAddResult, PagedItemCollection } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { IList } from '@pnp/sp/lists';

import * as _ from 'lodash';
import { filter } from 'lodash';

function Cobranca (props: ICobrancaProps) {

  const [prevClients, setPrevClients] = useState<IDataClient[]>(null);
  const [previousPage, setPreviousPage] = useState(null)
  const [currentPage, setCurrentPage] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [deleteModal, setDeleteModal] = useState<boolean>(false);
  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>(null);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>(null);
  // const [search, setSearch] = useState<string>();
  const [filter, setFilter] = useState<string>('Nome');
  
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
  });

  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const page: PagedItemCollection<IDataClient[]> = await sp.web.lists.getByTitle('Cobranças').items.top(5).getPaged();
    
    setAdminData(userAdmin);
    setListDataClient(page.results);
    setUnfilteredClients(page.results);
    setCurrentPage(page);
  }
  
  
  const loadMore = async () => {
    const nextPage = await currentPage.getNext()
    setPreviousPage(currentPage);
    setPrevClients(currentPage.results);
    setCurrentPage(nextPage);
    setListDataClient(nextPage.results);
    setUnfilteredClients(nextPage.results);
  }
  
  const prevPage = async () => {
    setCurrentPage(previousPage);
    setListDataClient(prevClients);
    setUnfilteredClients(prevClients);
  }

  const addCliente = async () => {
    const newClient: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add({
      Title: client.Title,
      Motivo: client.Motivo,
      situacao: client.situacao
    });
    loadData();
  }

  const deleteClient = async (id) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(id).delete();
    loadData();
  }
  
  const clientRender = () => (
    unfilteredClients !== null ? unfilteredClients.map(dataClient => (
      <tr>
        <td>{dataClient.Title}</td>
        <td>{dateFormat(dataClient.Created)}</td>
        <td>{dataClient.Motivo}</td>
        { dataClient.situacao === 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
      </tr>
    )) : []
  );

  const loading = unfilteredClients === null;

  const dateFormat = (date: string) => {
    let data = new Date(date);
    let dateFormated = ((data.getDate() )) + "-" + ((data.getMonth() + 1)) + "-" + data.getFullYear(); 
    return dateFormated;
  }
  
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
    setDeleteModal(!deleteModal);
  }

  const filterClient = (e) => {
    const el = e.target;
    if(el.id == 'filter') setFilter(el.value)
    if(filter == 'Nome') {
      const filtered = listDataClient.filter(data => data.Title.toLowerCase().includes(el.value.toLowerCase()));
      setUnfilteredClients(filtered);
    } else if(filter == 'Motivo') {
      const filtered = listDataClient.filter(data => data.Motivo.toLowerCase().includes(el.value.toLowerCase()));
      setUnfilteredClients(filtered);
    } else if (filter == 'Data') {
      const filtered = listDataClient.filter(data => data.Created.includes(el.value));
      setUnfilteredClients(filtered);
    }
  }

  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Painel do administrador</h3>
        <div>
          { adminData ? <img className={styles.iconAdmin} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${adminData.email}`} alt="admin-icon" /> : <img className={styles.iconAdmin} src="https://e7.pngegg.com/pngimages/636/819/png-clipart-computer-icons-privacy-policy-admin-icon-copyright-rim.png" alt="" /> }
          <span>Administrador</span>
        </div>
      </header>
      <main>
        <div className={styles.category}>
          <a href="#" onClick={handleModal}>Adicionar</a>
          <a href="#" onClick={handleDeleteModal}>Editar</a>
          <a href="#" onClick={handleDeleteModal}>Excluir</a>
        </div>
        <section className={styles.dataBox}>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div>
            <input id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={filterClient} />
            <label>Procurar por:</label>
            <select name="filter" id="filter" onChange={filterClient}>
              <option id="name">Nome</option>
              <option id="date">Data</option>
              <option id="description">Motivo</option>
            </select>
          </div>
        </div>
          {loading ? <div className={styles.loadbox}><div className={styles.loading}></div></div> : 
          <>
            <table>
              <tr>
                <th>Nome do cliente</th>
                <th>Data do registro</th>
                <th>Motivo do contato</th>
                <th>Situação</th>
              </tr>
            {clientRender()}
          </table>
          { currentPage !== null && currentPage.hasNext ? <div className={styles.paginationBtn}>
            <button onClick={prevPage}>Voltar</button>
            <button onClick={loadMore}>Avançar</button>
          </div> : <div className={styles.paginationBtn}>
            <button onClick={prevPage}>Voltar</button>
            <button onClick={loadMore} disabled>Avançar</button>
          </div> }
          </>
        }
        { deleteModal ? 
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
          <button className={styles.closeModal} onClick={handleDeleteModal}>X</button>
          <table>
            <tr>
              <th>Nome do cliente</th>
              <th>Data</th>
              <th>Motivo</th>
              <th>Situação</th>
              <th>Ação</th>
            </tr>
            { listDataClient.map(item => (
              <tr>
                <td>{item.Title}</td>
                <td>{dateFormat(item.Created)}</td>
                <td>{item.Motivo}</td>
                <td>{item.situacao}</td>
                <button onClick={() => deleteClient(item.Id)}>X</button>
              </tr>
            )) }
            { currentPage !== null && currentPage.hasNext ? <div className={styles.paginationBtn}>
            <button onClick={prevPage}>Voltar</button>
            <button onClick={loadMore}>Avançar</button>
          </div> : <div className={styles.paginationBtn}>
            <button onClick={prevPage}>Voltar</button>
            <button onClick={loadMore} disabled>Avançar</button>
          </div> }
          </table>
          </div>
        </div> : deleteModal }
        { showAddModal ? 
        <div className={styles.modalBackground}>
          <div className={styles.modalContent}>
            <button className={styles.closeModal} onClick={handleModal}>X</button>
            <h1>ADICIONAR NOVO CLIENTE</h1>
            <label>Nome do cliente:</label>
            <input id="nameClient" type="text" placeholder="Digite o nome completo do cliente" value={client.Title} onChange={defineValueInput} />
            <label>Motivo:</label>
            <input id="description" type="text" placeholder="Motivo do atendimento" value={client.Motivo} onChange={defineValueInput} />
            <label>Situação:</label>
            <select name="statusClient" id="statusClient" onChange={defineValueInput}>
              <option value="">----</option>
              <option value="Pendente">Em aberto</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <button className={styles.addButton} onClick={addCliente}>Adicionar</button>
          </div>
        </div> : showAddModal }
      </main>
    </div>
  )
}

export default Cobranca;