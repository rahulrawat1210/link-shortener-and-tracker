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
                                            oTable.fnClearTable();
                                            $.each(res, function (key, item) {
                                                oTable.fnAddData([item.shortURL, "<button class='btn btn-primary'>View Stats</button>", item.longURL, item.dateCreated]);
                                            });
                                    }
                                },
        dataType: "json",
            error: function(data){
                alert("Some error occurred in making request to server!!!");
            }
        });
});