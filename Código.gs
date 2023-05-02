function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('Index'); //chama o arquivo index.html 
}

function uuid() { //declara uma função uuid para retornar o id do registro
  var uuid_array = []; 
  // cria uma váriavel uuid_array e a inicializa com um array vazio
  var ss= SpreadsheetApp.getActiveSpreadsheet();
   // criei uma variavel ss e inicia com o obj ativo da planilha
  var dataSheet = ss.getSheetByName("DADOS"); 
  // criei uma variavel dataSheet e a inicia a aba Dados da planilha criada 
  var getLastRow = dataSheet.getLastRow(); //criei uma variável chamada getLastRow e a inicializa com o número da última linha preenchida da planilha

  // verifica se a ultima linha é maior que um 1
  if(getLastRow > 1) {
    var uuid_values = dataSheet.getRange(2, 1, getLastRow - 1, 1).getValues(); 
    // declara uma variavel chamada uuid_values e inicia com os valores da primeira coluna (A) da planilha, a partir da segunda linha até a última linha preenchida.
    for(i = 0; i < uuid_values.length; i++)
    {
      uuid_array.push(uuid_values[i][0]);
    }
    // o array uuid_values percorre e adiciona cada valor à uuid_array
    var x_count = 0;
    do {
    var y = 'false';
    var uuid_value = Utilities.getUuid(); // gera um id exclusivo 

    if(uuid_array.indexOf(uuid_value) == -1.0) // array q percorre a planilha para ver se o id ja existe
    {
      y = 'true';
      Logger.log(uuid_value);
      return uuid_value;   
    } 
    x_count++;
    } while (y == 'false' && x_count < 4);
    //do while gera um UUID exclusivo
  } else {
    return Utilities.getUuid();
  }
}
// a função update record recebe 4 parametros
function UpdateRecord(record_id, nomesolicitante, qtsolicitada, dtsolicita) {
  //a função SpreadsheetApp.getActiveSpreadsheet() obtém a planilha ativa do google, enquanto a segunda linha ss.getSheetByName("DADOS") obtém a planilha de nome "DADOS"
  var ss= SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("DADOS"); 
  var getLastRow = dataSheet.getLastRow();
  // pega o ultimo número da ultima linha preenchida 
  var table_values = dataSheet.getRange(2, 1, getLastRow - 1, 4).getValues();
  //table_values variavel responsavel por pegar todas as linhas
  //armazena os valores na planilha "DADOS", excluindo a primeira linha de cabeçalho. 
  for(i = 0; i < table_values.length; i++)
  
  {
    if(table_values[i][0] == record_id)
    //Verifica se o valor na primeira coluna da linha atual é igual a record
    {
      dataSheet.getRange(i+2, 2).setValue(nomesolicitante);
      dataSheet.getRange(i+2, 3).setValue(qtsolicitada);
      dataSheet.getRange(i+2, 4).setValue(dtsolicita);
      // se o id for igual vai atualizar os restantes dos dados
    }
    
  }
  return 'SUCCESS';
}
//essa função procura por uma linha na planilha "DADOS" que um Id unico (record_id) e, se encontrada, exclui toda a linha correspondente. 
//criei uma função Deleterecord com parametro record_id
// a função foi criada para deletar uma linha inteira de uma planilha chamada dados
function DeleteRecord(record_id)
{
  // pega a planilha ativa
  var ss= SpreadsheetApp.getActiveSpreadsheet();
  //pega a planilha de dados com o nome "DADOS"
  var dataSheet = ss.getSheetByName("DADOS"); 
  var getLastRow = dataSheet.getLastRow();
  var table_values = dataSheet.getRange(2, 1, getLastRow - 1, 8).getValues();

  //Percorre os valores da tabela em busca de um valor que corresponde ao record id
  for(i = 0; i < table_values.length; i++)
  {
    if(table_values[i][0] == record_id)
    {
      var rowNumber = i+2;
      //exclui a linha 
      dataSheet.deleteRow(rowNumber);
      
    }   
  }
  return 'SUCCESS';
}
// recebe 3 parametros nome, quantidade e data
//cria um ID único usando a função uuid() e verifica se já existe um registro vazio na planilha. Se existir, a função adiciona o novo registro a essa linha vazia, 
function AddRecord(nomesolicitante, qtsolicitada, dtsolicita) {
  var uniqueID = uuid();
  var found_record = false;
  var ss= SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("DADOS");
  var getLastRow = dataSheet.getLastRow();
  
  for(i = 2; i < getLastRow; i++)

  {
    if(dataSheet.getRange(i, 1).getValue() == '')
    //utilizado para encontrar uma linha vazia na planilha 
    {
      dataSheet.getRange('A' + i + ':I' + i).setValues([[uniqueID, nomesolicitante, qtsolicitada, ""]]);
      dataSheet.getRange(i, 4).setNumberFormat("@"); // adiciona a formatação de texto simples à célula
      dataSheet.getRange(i, 4).setValue(dtsolicita);
      found_record = true;
      break;
    }
  }
  if(found_record == false)
  { 
    dataSheet.appendRow([uniqueID, nomesolicitante, qtsolicitada, ""]); //add uma linha vazia
    dataSheet.getRange(getLastRow+1, 4).setNumberFormat("@"); // adiciona a formatação de texto simples à célula
    dataSheet.getRange(getLastRow+1, 4).setValue(dtsolicita);
  }
  return 'SUCCESS';
  
}

// criei a função de searchrecords com parametro nome solicitante, toda vez que o usuário digitar um
// nome vai constar automatico uma pesquisa
function searchRecords(nomesolicitante) 
{
// criei duas variaveis chamadas returnRows e all records
  var returnRows = []; // array  q será preenchido com as linhas que atendem aos critérios de busca
  var allRecords = getRecords(); // array que contem todos os registros na fonte de dados 

  allRecords.forEach(function(value, index) {

    var evalRows = [];
    if(nomesolicitante != '')
    {
      
      if(value[1].toUpperCase() == nomesolicitante.toUpperCase()) {
        evalRows.push('true');
      } else {
        evalRows.push('false');
      }
    }
    else
    {
       evalRows.push('true');
    }

    if(evalRows.indexOf("false") == -1)
    {
      returnRows.push(value);    
    }

  });

  return returnRows;
}

function getRecords() { 
  var return_Array = [];
  var ss= SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("DADOS"); 
  var getLastRow = dataSheet.getLastRow();
  for(i = 2; i <= getLastRow; i++)
  {
    if(dataSheet.getRange(i, 1).getValue() != '')
    {
      return_Array.push([dataSheet.getRange(i, 1).getValue(), 
      dataSheet.getRange(i, 2).getValue(),  
      dataSheet.getRange(i, 3).getValue(),
      dataSheet.getRange(i, 4).getValue()]);
    }
  }  
  return return_Array;  
}

function exportData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var dataSheet = ss.getSheetByName("DADOS");
  var dataRange = dataSheet.getDataRange();
  var values = dataRange.getValues();
  
  var doc = DocumentApp.create("Relatório de dados de consumo de copos");
  var body = doc.getBody();
  //body utilizada para armazenar o corpo do documento 

  // Adiciona uma tabela vazia com 4 colunas a página
  var table = body.appendTable();
  var headerRow = table.appendTableRow();
  headerRow.appendTableCell('ID');
  headerRow.appendTableCell('Nome');
  headerRow.appendTableCell('Quantidade');
  headerRow.appendTableCell('Data');

  // percorre sobre cada linha na planilha, menos a primeira  e adiciona uma linha na tabela para cada uma delas
  for (var i = 0; i < values.length; i++) {
    var row = values[i];
    var id = row[0];
    var nome = row[1];
    var quantidade = row[2];
    var data = row[3];
  
    // Adiciona uma nova linha à tabela com os valores da linha atual da planilha
    var tableRow = table.appendTableRow();
    tableRow.appendTableCell(id.toString());
    tableRow.appendTableCell(nome.toString());
    tableRow.appendTableCell(quantidade.toString());
    tableRow.appendTableCell(data.toString());
  }
  
  // Salva o documento na pasta teste criada no google driver
  var docFile = DriveApp.getFileById(doc.getId());
  var folder = DriveApp.getFolderById("1QQ7VQiHgliPso2GkTZdNGSwkX7o51yOO");
  folder.addFile(docFile);
  
  return 'SUCCESS';
}


function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate();
}
