$(document).ready(function() {
 
        $.ajax({
            type: "get",
            url: 'http://localhost:3000/getData',
                    success: function (res) { if(res.success==false){ $('#d1').hide(); $('#tb1 tbody').empty(); alert("Error in db!!!");}
                                    else if(res.length==0){ $('#d1').hide(); $('#tb1 tbody').empty(); alert('No data found!!!');}
                                    else{   $('#d1').show();
                                            $('#tb1 tbody').empty();
                                            var oTable = $('#tb1').dataTable({
                                                retrieve: true,
                                                dom: 'Bfrtip',
                                                buttons: [
                                                    'copyHtml5',
                                                    'excelHtml5',
                                                    'csvHtml5',
                                                ],
                                                "columnDefs": [
                                                    { "width": '50%', "targets": 2 }
                                                ]
                                            });
                                            //oTable.fnClearTable();
                                            $.each(res, function (key, item) {
                                                oTable.fnAddData([item.shortURL, "<button class='btn btn-primary query' data-toggle='modal' data-target='#exampleModalLong' value=" + item.shortURL +">View Stats</button>", item.longURL, item.dateCreated]);
                                               
                                            });
                                                                                
                                           
                                    }
                                   
                                },
        dataType: "json",
            error: function(data){
                alert("Some error occurred in making request to server!!!");
            }
        });        

        $('#tb1').on('click', '.query', function() {
            console.log("clicked!");
            var sUrl = $(this).val();
            
            $.ajax({
                url: 'http://localhost:3000/viewmore',
                type: 'post',
                data: {
                sURL: sUrl
                },
                dataType:'json',
                success: function(dta){
                if(dta.success==false){
                    alert("Problem in DB!!");
                }else{
                    $("#tb2 tbody").empty();
                    var oTable1 = $('#tb2').dataTable({
                        retrieve: true,
                        dom: 'Bfrtip',
                        buttons: [
                        {
                            extend: 'copyHtml5'
                        },
                        {
                            extend: 'excelHtml5'
                        },
                        {
                            extend: 'csvHtml5'
                        }
                        ]
                    });
                    oTable1.fnClearTable();
                    $.each(dta, function (key, item) {
                        console.log(item);
                        oTable1.fnAddData([`${item.ip}`, `${item.timestamp}`, `${item.country}`, `${item.city}`,`${item.region}` ,`${item.browser_type}`, `${item.device.os}`, `${item.device.devType}`]);
                    });
                    
                }
                },
                error: function(xhr) { alert("There is some problem in making request!!!!"); }
            });        
         });


});