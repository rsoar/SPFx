import { IPersonaProps, NormalPeoplePicker, people } from 'office-ui-fabric-react';

import "@pnp/sp/search";
import { ISearchQuery, SearchResults, SearchQueryBuilder } from "@pnp/sp/search";

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import styles from './Cobranca.module.scss';

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/site-users";

import { IItemAddResult, IItemUpdateResult, PagedItemCollection } from "@pnp/sp/items";
import { IDataClient } from '../../Interface/IDataClient';

import { PropertyPaneSlider } from '@microsoft/sp-property-pane';
import { ICobrancaProps } from './ICobrancaProps';
import { IDataAdmin } from '../../Interface/IDataAdmin';
import { IList } from '@pnp/sp/lists';

import * as _ from 'lodash';
import { add, filter } from 'lodash';
import { Modal } from '../Modal/Modal';
import { Add } from '../Modal/Add/Add';

function Cobranca (props: ICobrancaProps) {

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [editModal, setEditModal] = useState<boolean>(false);
  const [idClient, setIdClient] = useState<number>(null);

  const [adminData, setAdminData] = useState<IDataAdmin>();
  const [listDataClient, setListDataClient] = useState<IDataClient[]>([]);
  const [unfilteredClients, setUnfilteredClients] = useState<IDataClient[]>([]);
  const [client, setClient] = useState<IDataClient>({
    Title: '',
    Motivo: '',
    situacao: '',
    ImageUrl: '',
  });
  const [action, setAction] = useState<number>(0); // 0 - add user ~ 1- edit user

  /* states paginacao */
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(6);
  const pages = Math.ceil(unfilteredClients.length/pageSize);

  const picker = useRef(null);
  const [peopleList, setPeopleList] = useState<IPersonaProps[]>(null);
  const [peopleSelected, setPeopleSelected] = useState<IPersonaProps>();

  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    const userAdmin = props.context.pageContext.user;
    const allItems: IDataClient[] = await sp.web.lists.getByTitle("Cobranças").items.get();
    
    setAdminData(userAdmin);
    setListDataClient(allItems);
    setUnfilteredClients(allItems);
  }

  const loadMore = (e: any) => setCurrentPage(e.target.value);

  const addCliente = async () => {
    if (client.Title == '' || client.Motivo == '' || client.situacao == '' ) return alert('Insira os dados do cliente');
    const newClient: IItemAddResult = await sp.web.lists.getByTitle("Cobranças").items.add({
      Title: client.Title,
      Motivo: client.Motivo,
      situacao: client.situacao,
      ImageUrl: client.ImageUrl
    });
    loadData();
    setClient({...client, Title: '', Motivo: ''})
  }

  const deleteClient = async (id: number) => {
    await sp.web.lists.getByTitle("Cobranças").items.getById(id).delete();
    loadData();
  }

  const updateClient = async (dataClient: IDataClient) => {
    const list = sp.web.lists.getByTitle("Cobranças")
    await list.items.getById(dataClient.Id).update({
        Title: dataClient.Title,
        Motivo: dataClient.Motivo,
        situacao: dataClient.situacao
    })
    loadData();
    setEditModal(!editModal);
  }
  
  const loading = unfilteredClients === null;

  const dateFormat = (date: string) => {
    let data = new Date(date);
    let dateFormated = ((data.getDate() )) + "-" + ((data.getMonth() + 1)) + "-" + data.getFullYear(); 
    return dateFormated;
  }
  
  const defineValueInput = (e: React.ChangeEvent<HTMLInputElement>) => setClient({ ...client, [e.target.name]: e.target.value });

  const handleModal = () => {
    setAction(0);
    setShowAddModal(!showAddModal);
  }

  const handleshowDeleteModal = (clientID: number) => {
    setShowDeleteModal(!showDeleteModal);
    setIdClient(clientID);
  }

  const handleEditModal = (dataClient: IDataClient) => {
    setAction(1);
    setClient({...client, Id: dataClient.Id, Title: dataClient.Title, Motivo: dataClient.Motivo, situacao: dataClient.situacao });
    setEditModal(!editModal);
  }

  const handleFilterClients = (e) => {
    const filtered = listDataClient.filter(item => (
      item.Title.toLowerCase().includes(e.target.value) || item.Motivo.toLowerCase().includes(e.target.value) || item.situacao.toLowerCase().includes(e.target.value)
    ));
    setUnfilteredClients(filtered);
  }

  const pickerMethod = () => {
    const onResolveSuggestions = async ( filterText: string, currentPersonas: IPersonaProps[] ) => {
      const personas = await sp.searchWithCaching({
          Querytext: `Title: "${filterText}*" OR WorkEmail: "${filterText}*"`,
          SourceId: "b09a7990-05ea-4af9-81ef-edfab16c4e31",
          RowLimit: 100,
      });
  
      const currentEmails = currentPersonas.map(x => x.secondaryText);
  
      let parsedPersonas = personas.PrimarySearchResults.map((persona:any) => {
          return {
              id: persona.ID,
              accountName: persona.AccountName,
              workEmail: persona.WorkEmail,
              secondaryText: persona.WorkEmail,
              text: persona.PreferredName,
              imageUrl: `/_vti_bin/DelveApi.ashx/people/profileimage?size=S&userId=${persona.WorkEmail}`,
              showInitialsUntilImageLoads: true
          } as IPersonaProps;
      }).filter(x => !currentEmails.includes(x.secondaryText));

      setPeopleList(parsedPersonas);
      filterPeople(parsedPersonas);

      return parsedPersonas;
    };
    
    return <NormalPeoplePicker ref={picker} onResolveSuggestions={onResolveSuggestions} {...props} onChange={filterPeople}/>;
  }

  const filterPeople = (personas: IPersonaProps[]) => {
   personas.forEach(item => {
     setClient({...client, Title: item.text, ImageUrl: item.imageUrl})
    });
    console.log(client)
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
          <a href="#" onClick={handleModal}>NOVO CLIENTE</a>
        </div>
        <section className={styles.dataBox}>
          <p>Número de clientes cadastrados: <span className={styles.countBox}>{listDataClient.length}</span></p>
          <p>Clientes com situação <span className={styles.statusPending}>pendente</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Pendente').length}</span></p>
          <p>Clientes com situação <span className={styles.statusFinish}>finalizado</span>: <span className={styles.countBox}>{listDataClient.filter(data => data.situacao === 'Finalizado').length}</span></p>
        </section>
        <div className={styles.infoHeader}>
          <h2>Lista de clientes</h2>
          <div>
            <div className={styles.teste}>
              <input autoComplete="off" id="searchInput" className={styles.inputSearchClient} type="text" placeholder="Busca..." onChange={handleFilterClients} />
            </div>
          </div>
        </div>
          {loading ? <div className={styles.loadbox}><div className={styles.loading}></div></div> : 
          <>
            <table>
              <tr>
                <th>Cliente</th>
                <th>Data do registro</th>
                <th>Motivo do contato</th>
                <th>Situação</th>
                <th>Ação</th>
              </tr>
            {unfilteredClients !== null && (
              unfilteredClients.slice(currentPage * pageSize, currentPage * pageSize + pageSize).map(dataClient => (
                <tr>
                  <td className={styles.align}><img className={styles.iconAdmin} src={dataClient.ImageUrl} alt={dataClient.Title} /> {dataClient.Title}</td>
                  <td>{dateFormat(dataClient.Created)}</td>
                  <td>{dataClient.Motivo}</td>
                  { dataClient.situacao == 'Finalizado' ? <td className={styles.statusFinish}>{dataClient.situacao}</td> : <td className={styles.statusPending}>{dataClient.situacao}</td> }
                  <td>
                    <button className={styles.deleteInfo} onClick={() => handleshowDeleteModal(dataClient.Id)}>X</button>
                    <button onClick={() => handleEditModal(dataClient)}>Edit</button>
                  </td>
                </tr>
              )))}
            </table>
            <div className={styles.paginationContainer}>
              { Array.from(Array(pages), (item, index) => (
                <div>
                  <button className={styles.paginationButtons} value={index} onClick={(e) => loadMore(e)}>{index + 1}</button>
                </div>
              )) }
            </div>
          </>
        }
        {/* Modal add */}
        { showAddModal ? < Add pickerMethod={pickerMethod} peopleSelected={peopleSelected} picker={picker} action={action} client={client} handleModal={handleModal} defineValueInput={defineValueInput} addClient={addCliente} updateClient={updateClient}/> : showAddModal }
        {/* Modal delete */}
        { showDeleteModal ? 
          <div className={styles.modalBackground}>
            <div className={styles.modalContent}>
              <h1>TEM CERTEZA QUE DESEJA EXCLUIR?</h1>
              <div>
                <button onClick={() => setShowDeleteModal(!showDeleteModal)}>NÃO</button>
                <button onClick={() =>{
                  setShowDeleteModal(!showDeleteModal);
                  deleteClient(idClient);
                }}>SIM</button>
              </div>
            </div>
          </div>
           : !showDeleteModal }
        {/* Modal edit */}
        { editModal ? < Add pickerMethod={pickerMethod} peopleSelected={peopleSelected} picker={picker} action={action} client={client} handleModal={handleEditModal} defineValueInput={defineValueInput} addClient={addCliente} updateClient={updateClient}/> 
        : editModal }
      </main>
    </div>
  )
}

export default Cobranca;