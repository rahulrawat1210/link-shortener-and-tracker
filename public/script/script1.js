$(document).ready(function () {

    $.ajax({
        type: "get",
        url: 'http://localhost:3000/getData',
        success: function (res) {
            if (res.success == false) {
                $('#d1').hide();
                $('#tb1 tbody').empty();
                alert("Error in db!!!");
            } else if (res.length == 0) {
                $('#d1').hide();
                $('#tb1 tbody').empty();
                alert('No data found!!!');
            } else {
                $('#d1').show();
                $('#tb1 tbody').empty();
                var oTable = $('#tb1').dataTable({
                    retrieve: true,
                    dom: 'Bfrtip',
                    buttons: [
                        'copyHtml5',
                        'excelHtml5',
                        'csvHtml5',
                    ],
                    "columnDefs": [{
                        "width": '50%',
                        "targets": 2
                    }]
                });
                //oTable.fnClearTable();
                $.each(res, function (key, item) {
                    oTable.fnAddData([item.shortURL, "<button class='btn btn-primary query' data-toggle='modal' data-target='#exampleModalLong' value=" + item.shortURL + ">View All Stats</button>", item.longURL, item.numHits, item.dateCreated]);

                });

            }

        },
        dataType: "json",
        error: function (data) {
            alert("Some error occurred in making request to server!!!");
        }
    });

    $('#tb1').on('click', '.query', function () {
        console.log("clicked!");
        var sUrl = $(this).val();

        $.ajax({
            url: 'http://localhost:3000/viewmore',
            type: 'post',
            data: {
                sURL: sUrl
            },
            dataType: 'json',
            success: function (dta) {
                if (dta.success == false) {
                    alert("Problem in DB!!");
                } else {
                    $("#tb2 tbody").empty();
                    var oTable1 = $('#tb2').dataTable({
                        retrieve: true,
                        dom: 'Bfrtip',
                        buttons: [{
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
                        if(item.country != 0 && item.country != undefined) {
                            oTable1.fnAddData([`${item.ip}`, `${item.timestamp}`, `${item.browser_type}`, `${item.device.os}`, `${item.device.devType}`, `${item.city}`, `${item.country}`, `${item.region}`]);

                        } else {
                            oTable1.fnAddData([`${item.ip}`, `${item.timestamp}`, `${item.browser_type}`, `${item.device.os}`, `${item.device.devType}`,  "<button class='btn btn-success ipQuery' value=" + item.ip + ">View Stats</button>",  "<button class='btn btn-success ipQuery' value=" + item.ip + ">View Stats</button>",  "<button class='btn btn-success ipQuery' value=" + item.ip + ">View Stats</button>"]);
                        }
                    });
                }
            },
            error: function (xhr) {
                alert("There is some problem in making request!!!!");
            }
        });
    });

    $('#tb2').on('click', '.ipQuery', function () {
        console.log("clicked!");
        var ip = $(this).val();
        var table = $('#tb2').DataTable();
        var tr = $(this).parents()[1];

        var dataArray = table.row(tr).data();

        $.ajax({
            url: 'http://localhost:3000/ipInfo',
            type: 'post',
            data: {
                ip: ip
            },
            dataType: 'json',
            success: function (dta) {
                if (dta.success == false) {
                    alert("Problem in DB!!");
                } else {
                    $.each(dta, function (key, item) {
                        console.log(item);
                        dataArray[5] = item.city;
                        dataArray[6] = item.country;
                        dataArray[7] = item.region;
                        table.row(tr).data(dataArray).draw();
                    });
                }
            },
            error: function (xhr) {
                alert("There is some problem in making request!!!!");
            }
        });
    });
});