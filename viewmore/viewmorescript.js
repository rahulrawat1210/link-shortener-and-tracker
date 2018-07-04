$(document).ready(function () {
  var shortURL = $('#sUrl');
    $.ajax({
        url: '/viewmore',
        type: 'post',
        data: {
          sURL: shortURL
          
        },
        dataType:'json',
        success: function(dta){
          if(dta.success==false){
            alert("Problem in DB!!");
          }else{
            $("#tb1 tbody").empty();
            var oTable1 = $('#tb1').dataTable({
                retrieve: true,
                dom: 'Bfrtip',
                buttons: [
                  {
                    extend: 'copyHtml5'
                  },
                  {
                      extend: 'excelHtml5',
                      title: siteid
                  },
                  {
                      extend: 'csvHtml5',
                      title: siteid
                  }
                ]
            });
            oTable1.fnClearTable();
            $.each(dta, function (key, item) {
                oTable1.fnAddData([`${item.ip}`, `${item.timestamp}`, `${item.country}`, `${item.city}`, `${item.browser_type}`, `${item.url_ID}`, `${item.device.devType}`, `${item.device.os}`]);
            });
            
          }
        },
        error: function(xhr) { alert("There is some problem in making request!!!!"); }
      });



});