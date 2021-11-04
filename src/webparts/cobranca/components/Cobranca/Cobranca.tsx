import * as React from 'react';

import { useState, useEffect, useRef } from 'react';
import styles from './Cobranca.module.scss';
import modalStyles from '../Modal/Add/Modal.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/search";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import Tabela from '../Tabela/Tabela';

import { IDataClient } from '../../Interface/IDataClient';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { Add } from '../Modal/Add/Add';

import * as _ from 'lodash';
import { filter } from 'lodash';

import { IPersonaProps } from 'office-ui-fabric-react';
import { Icon } from 'office-ui-fabric-react';
import DatePickerBasicExample from '../Picker/DatePicker';

function Cobranca (props: ICobrancaProps): JSX.Element {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>(null);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>(null);
  const [listPagination, setListPagination] = useState<IDataClient[]>([]);
  const [clientSelected, setClientSelected] = useState<IPersonaProps>(null);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
    ImageUrl: '',
  });
  const [action, setAction] = useState<number>(0); // 0 - add user ~~~ 1- edit user

  const pageSize = 6;
  const [currentPage, setCurrentPage] = useState<number>(0);
  const pages = Math.ceil(listPagination.length/pageSize);

  const [currentClients, setCurrentClients] = useState<IPersonaProps[]>(null);

  const loading = unfilteredClients === null;

  useEffect(() => {
    loadData();
  }, [])

  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const allItems: IDataClient[] = await sp.web.lists.getByTitle("Cobranças").items.get();
    
    setAdminData(userAdmin);
    setListDataClient(allItems);
    setUnfilteredClients(allItems);
    setListPagination(allItems);
  }

  const loadMore = (e: any) => setCurrentPage(e.target.value);

  const addClient = async () => {
    if(client.Title == '' || client.Motivo == '' || client.situacao == '' ||  client.ImageUrl == '') return alert("Preencha todos os campos");
    await Promise.all(currentClients.map(async (item: IPersonaProps) => {
      await sp.web.lists.getByTitle("Cobranças").items.add({
        Title: item.text,
        Motivo: client.Motivo,
        situacao: client.situacao,
        ImageUrl: item.imageUrl
      });
      loadData();
    }));

    clearInput();
    setShowAddModal(!showAddModal);
  }
  
  const deleteClient = async (dataClient: IDataClient) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(dataClient.Id).delete();
    loadData();
  }

  const updateClient = async (data: IDataClient) => {
    if(data.Title == '' || data.Motivo == '' || data.situacao == '' ||  data.ImageUrl == '') return alert("Preencha todos os campos");
    const list = await sp.web.lists.getByTitle("Cobranças");
    await list.items.getById(client.Id).update({
      Title: data.Title,
      Motivo: data.Motivo,
      situacao: data.situacao,
      ImageUrl: data.ImageUrl,
    });
    loadData();
    clearInput();
    setShowEditModal(!showEditModal);
  }

  const formatDate = (date: string, count: number) => {
    const data = new Date(date);
    return data.toLocaleString().substr(0, count).replace(' ', ' às ');
  }

  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => setClient({ ...client, [e.target.name]: e.target.value });

  const handleModal = () => {
    setAction(0);
    setShowAddModal(!showAddModal);
  }

  const clearInput = () => setClient({...client, Title: '', Motivo: '', situacao: ''});

  const handleShowDeleteModal = (client: IDataClient) => {
    setShowDeleteModal(!showDeleteModal);
    setClient(client);
  }

  const handleEditModal = (dataClient: IDataClient) => {
    setAction(1);
    setClient({...client, Title: dataClient.Title, Motivo: dataClient.Motivo, situacao: dataClient.situacao, Modified: dataClient.Modified, ImageUrl: dataClient.ImageUrl, Id: dataClient.Id});
    setShowEditModal(!showEditModal);
    setClientSelected({...clientSelected, text: dataClient.Title, imageUrl: dataClient.ImageUrl, secondaryText: dataClient.secondaryText});
  }

  const handleFilterClients = (e: any) => {
    const filtered = listDataClient.filter(item => (
      item.Title.toLowerCase().includes(e.target.value) || item.Motivo.toLowerCase().includes(e.target.value) || item.situacao.toLowerCase().includes(e.target.value)
    ));
    setUnfilteredClients(filtered);
    setListPagination(filtered);
  }

  const currentClient = (clients: IPersonaProps[]) => {
    setCurrentClients(clients);
    clients.forEach((item: IPersonaProps) => {
      setClient({...client, Title: item.text, ImageUrl: item.imageUrl});
    });
  }

  const handleFilterDate = (date: Date) => {
    const filtered = listDataClient.filter(item => formatDate(item.Created, 10) === formatDate(date.toString(), 10));
    setUnfilteredClients(filtered);
  }
  

  return (
    <div className={styles.bgContainer}>
      <header>
        <h3>Painel do administrador</h3>
        <div>
          { adminData ? <img className={styles.iconAdmin} src={`/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${adminData.email}`} alt="admin-icon" /> : <img className={styles.iconAdmin} src="https://e7.pngegg.com/pngimages/636/819/png-clipart-computer-icons-privacy-policy-admin-icon-copyright-rim.png" alt="" /> }
          Administrador
        </div>
      </header>
      <main>
        <div className={styles.category}>
          <a href="#" onClick={handleModal}>NOVO CLIENTE</a>
        </div>
        <section className={styles.dataBox}>
          <p>Número de clientes cadastrados: {unfilteredClients !== null ? unfilteredClients.length : 0}</p>
          <p>Clientes com situação <span className={modalStyles.statusPending}>pendente</span>: {unfilteredClients !== null ? unfilteredClients.filter(data => data.situacao === 'Pendente').length : 0}</p>
          <p>Clientes com situação <span className={modalStyles.statusFinish}>finalizado</span>: {unfilteredClients !== null ? unfilteredClients.filter(data => data.situacao === 'Finalizado').length : 0}</p>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div className={styles.infoContainer}>
            <input autoComplete="off" id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={handleFilterClients} />
            <div className={styles.dateContainer}>
              {<DatePickerBasicExample onSelectDate={date => handleFilterDate(date)}/>}
              <button onClick={() => {setUnfilteredClients(listDataClient)}}>Remover filtro</button>
            </div>
          </div>
        </div>
          {loading ? 
            <div className={styles.loadbox}>
              <div className={styles.loading}></div>
            </div> : 
            < Tabela 
                unfilteredClients={unfilteredClients}
                currentPage={currentPage}
                pageSize={pageSize}
                pages={pages}
                loading={loading}
                editModal={handleEditModal}
                deleteModal={handleShowDeleteModal}
                formatDate={formatDate}
                loadMore={loadMore}
              /> }
        { showAddModal ? 
            < Add
              clear={clearInput}
              currentClient={currentClient}
              action={action}
              client={client}
              handleModal={handleModal}
              defineValueInput={defineValueInput}
              addClient={addClient}
              updateClient={updateClient}
              clientSelected={clientSelected}
            />
            : showAddModal }
        { showDeleteModal ? 
          <div className={modalStyles.modalBackground}>
            <div className={modalStyles.modalContent}>
              <h1>TEM CERTEZA QUE DESEJA EXCLUIR?</h1>
              <div>
                <button onClick={() => setShowDeleteModal(!showDeleteModal)}>NÃO</button>
                <button onClick={() =>{
                  setShowDeleteModal(!showDeleteModal);
                  deleteClient(client);
                }}>SIM</button>
              </div>
            </div>
          </div>
           : showDeleteModal }
        { showEditModal ?
            < Add 
              clear={clearInput}
              currentClient={currentClient}
              action={action}
              client={client}
              handleModal={handleEditModal}
              defineValueInput={defineValueInput}
              addClient={addClient}
              updateClient={updateClient}
              clientSelected={clientSelected}
            /> 
          : showEditModal }
      </main>
    </div>
  )
}

export default Cobranca;