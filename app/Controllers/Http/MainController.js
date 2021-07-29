"use strict";

const Swab = use("App/Models/Swab");
const Excel = require("exceljs");
const regeneratorRuntime = require("regenerator-runtime");
const Helpers = use("Helpers");
const moment = require("moment");
// const dateObj = new Date();
// const month = monthNames[dateObj.getMonth()];
// const day = String(dateObj.getDate()).padStart(2, "0");
// const year = dateObj.getFullYear();
// const keluarantanggal = day + "," + month + "," + year;
// export default async function foo() {
//   var s = await bar();
//   console.log(s);
// }

// function bar() {
//   return "bar";
// }

class MainController {
  async detail({ response, request, view }) {
    const { inputNIK, inputTanggalLahir, inputTanggalSwab } = request.post();

    const res = await Swab.query()
      .where({ nik: inputNIK })
      .andWhere({ tgl_lahir: inputTanggalLahir })
      .andWhere({ pengambilan_spesimen: inputTanggalSwab })
      .first();

    const tanggalLahir = moment(res.tgl_lahir).format("YYYY-MM-DD");
    const tanggalSpesimen = moment(res.pengambilan_spesimen).format(
      "YYYY-MM-DD"
    );

    // return res;
    if (!res) {
      return response.notFound({ message: "Data Tidak Ditemukan" });
    }

    // session.flash({ notification: `Selamat Datang ${res.nama}` });
    return view.render("detail", { res: res, tanggalLahir, tanggalSpesimen });
  }

  async importSwabServices(filelocation, sekolah) {
    var workbook = new Excel.Workbook();

    workbook = await workbook.xlsx.readFile(filelocation);

    let explanation = workbook.getWorksheet("DaftarPengambilanSpesimen");

    let colComment = explanation.getColumn("A");

    let data = [];

    colComment.eachCell(async (cell, rowNumber) => {
      if (rowNumber >= 9) {
        data.push({
          nama: explanation.getCell("B" + rowNumber).value,
          nik: explanation.getCell("C" + rowNumber).value,
          tgl_lahir: explanation.getCell("D" + rowNumber).value,
          usia: explanation.getCell("E" + rowNumber).value,
          jk: explanation.getCell("F" + rowNumber).value,
          alamat: explanation.getCell("G" + rowNumber).value,
          provinsi: explanation.getCell("H" + rowNumber).value,
          kota: explanation.getCell("I" + rowNumber).value,
          kecamatan: explanation.getCell("J" + rowNumber).value,
          kelurahan: explanation.getCell("K" + rowNumber).value,
          rw: explanation.getCell("L" + rowNumber).value,
          rt: explanation.getCell("M" + rowNumber).value,
          pengambilan_spesimen: explanation.getCell("N" + rowNumber).value,
          no_spesimen: explanation.getCell("O" + rowNumber).value,
          hasil: explanation.getCell("P" + rowNumber).value,
        });
      }
    });

    const result = await Promise.all(
      data.map(async (d) => {
        // const tanggalLahir = d.tgl_lahir.moment();
        // const tanggalLahir = moment(d.tgl_lahir).format("YYYY-MM-DD");
        // const tanggalSpesimen = moment(d.pengambilan_spesimen).format(
        //   "YYYY-MM-DD"
        // );
        const swab = await Swab.create({
          nama: d.nama,
          nik: d.nik,
          tgl_lahir: d.tgl_lahir,
          usia: d.usia,
          jk: d.jk,
          alamat: d.alamat,
          provinsi: d.provinsi,
          kota: d.kota,
          kecamatan: d.kecamatan,
          kelurahan: d.kelurahan,
          rw: d.rw,
          rt: d.rt,
          pengambilan_spesimen: d.pengambilan_spesimen,
          no_spesimen: d.no_spesimen,
          hasil: d.hasil,
          dihapus: 0,
        });

        return;
      })
    );

    return result;
  }

  async importSwab({ request, response }) {
    let file = request.file("file");
    let fname = `import-excel.${file.extname}`;

    //move uploaded file into custom folder
    await file.move(Helpers.tmpPath("/uploads"), {
      name: fname,
      overwrite: true,
    });

    if (!file.moved()) {
      return fileUpload.error();
    }

    return await this.importSwabServices(`tmp/uploads/${fname}`);
  }

  async downloadSwab({ response, request, auth }) {
    const domain = request.headers().origin;

    const sekolah = await this.getSekolahByDomain(domain);

    if (sekolah == "404") {
      return response.notFound({ message: "Sekolah belum terdaftar" });
    }

    const swab = await Swab.query().where({ dihapus: 0 }).fetch();
    const swab1 = await Swab.query().where({ dihapus: 0 }).first();

    let workbook = new Excel.Workbook();
    let worksheet = workbook.addWorksheet(`DaftarPengambilanSampel`);
    // worksheet.mergeCells("A1:K1");
    // worksheet.mergeCells("A2:K2");
    worksheet.getCell("A7").value = `Keadaan tanggal ${keluarantanggal} `;
    worksheet.addConditionalFormatting({
      ref: "A1:K5",
      rules: [
        {
          type: "expression",
          formulae: ["MOD(ROW()+COLUMN(),1)=0"],
          style: {
            font: {
              name: "Calibri",
              family: 4,
              size: 14,
              bold: true,
            },
            // fill: {
            //   type: "pattern",
            //   pattern: "solid",
            //   bgColor: { argb: "C0C0C0", fgColor: { argb: "C0C0C0" } },
            // },
            alignment: {
              vertical: "middle",
              horizontal: "left",
            },
            // border: {
            //   top: { style: "thin" },
            //   left: { style: "thin" },
            //   bottom: { style: "thin" },
            //   right: { style: "thin" },
            // },
          },
        },
      ],
    });
    worksheet.addConditionalFormatting({
      ref: "A8:P8",
      rules: [
        {
          type: "expression",
          formulae: ["MOD(ROW()+COLUMN(),1)=0"],
          style: {
            font: {
              name: "Times New Roman",
              family: 4,
              size: 12,
              bold: true,
            },
            fill: {
              type: "pattern",
              pattern: "solid",
              bgColor: { argb: "C0C0C0", fgColor: { argb: "C0C0C0" } },
            },
            alignment: {
              vertical: "middle",
              horizontal: "center",
            },
            border: {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            },
          },
        },
      ],
    });
    worksheet.getCell("A1").value = "DAFTAR PENGAMBILAN SAMPEL PASIEN";
    worksheet.getCell(
      "A2"
    ).value = `PROVINSI DKI JAKARTA - KOTA ADM. JAKARTA TIMUR`;
    worksheet.getCell(
      "A3"
    ).value = `FASKES PENGINPUT SPESIMEN PUSKESMAS KECAMATAN JATINEGARA`;
    worksheet.getCell(
      "A4"
    ).value = `TANGGAL PENGAMBILAN SPESIMEN ${swab1.pengambilan_spesimen}`;
    worksheet.getCell("A5").value = `TANGGAL INPUT SISTEM ${swab1.created_at}`;
    await Promise.all(
      Swab.toJSON().map(async (d, idx) => {
        worksheet.addConditionalFormatting({
          ref: `B${(idx + 1) * 1 + 8}:P${(idx + 1) * 1 + 8}`,
          rules: [
            {
              type: "expression",
              formulae: ["MOD(ROW()+COLUMN(),1)=0"],
              style: {
                font: {
                  name: "Times New Roman",
                  family: 4,
                  size: 11,
                  // bold: true,
                },
                alignment: {
                  vertical: "middle",
                  horizontal: "left",
                },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              },
            },
          ],
        });
        worksheet.addConditionalFormatting({
          ref: `A${(idx + 1) * 1 + 8}`,
          rules: [
            {
              type: "expression",
              formulae: ["MOD(ROW()+COLUMN(),1)=0"],
              style: {
                font: {
                  name: "Times New Roman",
                  family: 4,
                  size: 11,
                  // bold: true,
                },
                alignment: {
                  vertical: "middle",
                  horizontal: "center",
                },
                border: {
                  top: { style: "thin" },
                  left: { style: "thin" },
                  bottom: { style: "thin" },
                  right: { style: "thin" },
                },
              },
            },
          ],
        });
        // add column headers
        worksheet.getRow(9).values = [
          "No",
          "Nama",
          "NIK/No Pasport",
          "Tgl Lahir",
          "Usia (thn)",
          "Jenis Kelamin",
          "Alamat Domisili",
          "Provinsi Domisili",
          "Kab/Kota Domisili",
          "Kecamatan Domisili",
          "Kelurahan Domisili",
          "RW Domisili",
          "RT Domisili",
          "Tgl Pengambilan Spesimen",
          "Nomor Spesimen",
          "Hasil Pemeriksaan",
        ];
        worksheet.columns = [
          { key: "no" },
          { key: "nama" },
          { key: "kode_Swab" },
          { key: "merk" },
          { key: "tahun_beli" },
          { key: "asal" },
          { key: "harga" },
          { key: "deskripsi" },
          { key: "status" },
          { key: "kepemilikan" },
          { key: "lokasi" },
        ];

        // Add row using key mapping to columns
        let row = worksheet.addRow({
          no: `${idx + 1}`,
          nama: d ? d.nama : "-",
          kode_Swab: d ? d.kode_Swab : "-",
          merk: d ? d.merk : "-",
          tahun_beli: d ? d.tahun_beli : "-",
          asal: d ? d.asal : "-",
          harga: d ? d.harga : "-",
          deskripsi: d ? d.deskripsi : "-",
          status: d ? d.status : "-",
          kepemilikan: d ? d.kepemilikan : "-",
          lokasi: d ? d.lokasi : "-",
        });
      })
    );
    let namaFile = `/uploads/rekap-Swab.xlsx`;

    // save workbook to disk
    await workbook.xlsx.writeFile(`public${namaFile}`);

    return namaFile;
  }

  async getHome({ auth, response, request }) {
    const swab = await Swab.query()
      .select("nik", "tgl_lahir")
      .where({ dihapus: 0 })
      .fetch();

    return view.render("home", { swab: swab });
  }
}

module.exports = MainController;
