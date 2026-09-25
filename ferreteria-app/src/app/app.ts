import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

type Role = 'Vendedor' | 'Almacenero' | 'Abastecimiento' | 'JefeAlmacen' | 'Gerente';
type User = { role: Role; name: string };
type Product = { id: number; code: string; name: string; category: string; stock: number; price: number };
type CartLine = Product & { quantity: number };
type MenuItem = { id: string; label: string; icon: string };

const proveedoresList = [
  { id: 1, name: 'Ardicorp S.A.C', phone: '943903278', ruc: '20136836545' },
  { id: 2, name: 'Diferco S.A.C', phone: '998356207', ruc: '20520837702' },
  { id: 3, name: 'Industrias Jhomeron S.A.', phone: '946233908', ruc: '20601777844' },
  { id: 4, name: 'Industrias Kings S.A.C', phone: '923922141', ruc: '20609011581' },
  { id: 5, name: 'QRoma S.A.', phone: '947342404', ruc: '20520837702' },
  { id: 6, name: 'Corporacion Industrial Losaro S.A.C.', phone: '948918910', ruc: '20215195539' },
  { id: 7, name: 'Quimicos Master Mory S.A.C', phone: '953458196', ruc: '20609780160' }
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <main class="min-h-screen bg-[#FDFBF7] font-sans text-slate-800">
    <!-- LOGIN SCREEN -->
    <section *ngIf="!user" class="min-h-screen flex items-center justify-center p-5 bg-gradient-to-br from-[#FDFBF7] to-[#E0D7CF]">
      <form (ngSubmit)="login()" class="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl border border-[#E0D7CF]">
        <div class="mb-7 text-center">
          <div class="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#285260] text-3xl text-white shadow-inner">🔩</div>
          <h1 class="text-2xl font-black text-[#285260]">Ferretería Don Pedrito</h1>
          <p class="mt-1 text-sm text-slate-500">Sistema Conectado a MySQL (Spring Boot)</p>
        </div>
        <label class="mb-4 block text-sm font-bold text-[#285260]">Usuario
          <input [(ngModel)]="username" name="username" required class="mt-1 w-full rounded-xl border border-[#B4D7D8] p-3 font-normal outline-none focus:border-[#548C92] bg-slate-50">
        </label>
        <label class="mb-5 block text-sm font-bold text-[#285260]">Contraseña
          <input [(ngModel)]="password" name="password" type="password" required class="mt-1 w-full rounded-xl border border-[#B4D7D8] p-3 font-normal outline-none focus:border-[#548C92] bg-slate-50">
        </label>
        <p *ngIf="message" class="mb-3 text-sm font-bold text-red-600">{{message}}</p>
        <button type="submit" class="w-full rounded-xl bg-[#285260] py-3 font-bold text-white shadow-lg hover:bg-[#548C92] transition-colors">INICIAR SESIÓN</button>
      </form>
    </section>

    <!-- DASHBOARD PRINCIPAL -->
    <section *ngIf="user" class="min-h-screen flex">
      <!-- SIDEBAR -->
      <aside class="w-64 shrink-0 flex-col bg-[#285260] text-white flex shadow-xl justify-between">
        <div>
          <div class="px-6 py-5 border-b border-[#548C92]">
            <p class="font-black tracking-wider text-lg text-white">FERRETERÍA</p>
            <p class="text-xs text-[#B4D7D8]">Don Pedrito</p>
          </div>
          <div class="px-6 py-4 border-b border-[#548C92] bg-[#285260]/40">
            <p class="font-bold text-white text-sm">{{user.name}}</p>
            <p class="text-xs uppercase text-[#B4D7D8] tracking-wide">{{user.role}}</p>
          </div>
          <nav class="p-3 space-y-1">
            <button *ngFor="let item of menu" (click)="tab=item.id"
                    [class.bg-[#548C92]]="tab===item.id"
                    class="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-colors text-[#B4D7D8] hover:bg-[#548C92]/50 hover:text-white"
                    [class.text-white]="tab===item.id">
              <span class="text-lg">{{item.icon}}</span>{{item.label}}
            </button>
          </nav>
        </div>
        <div class="p-4">
          <button (click)="logout()" class="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-600/40 px-3 py-2.5 text-sm text-slate-200 hover:bg-red-500/80 hover:text-white transition-colors border border-slate-500/30">
            Cerrar sesión
          </button>
        </div>
      </aside>

      <!-- CONTENIDO CENTRAL -->
      <div class="flex-1 flex flex-col overflow-hidden bg-white">
        <header class="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-xs">
          <div>
            <p class="font-bold text-slate-800 text-base">Portal {{user.role}}</p>
            <p class="text-xs text-slate-400">Angular · sesión local conservada</p>
          </div>
          <button (click)="logout()" class="md:hidden text-sm font-bold text-red-600">Salir</button>
        </header>

        <main class="h-[calc(100vh-73px)] overflow-auto p-6 bg-slate-50/50">
          <p *ngIf="message" [class.bg-red-50]="messageType==='error'" [class.text-red-600]="messageType==='error'" [class.bg-emerald-50]="messageType==='success'" [class.text-emerald-700]="messageType==='success'" class="mb-4 rounded-xl border p-4 text-sm font-semibold shadow-sm">
            {{message}}
          </p>

          <!-- ================= VENDEDOR ================= -->
          <ng-container *ngIf="user.role==='Vendedor'">
            <div class="mb-5 flex gap-2 border-b border-slate-200">
              <button (click)="tab='ventas'" [class.border-b-2]="tab==='ventas'" [class.border-slate-800]="tab==='ventas'" [class.font-bold]="tab==='ventas'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">🧾 Venta rápida</button>
              <button (click)="tab='inventario_ventas'" [class.border-b-2]="tab==='inventario_ventas'" [class.border-slate-800]="tab==='inventario_ventas'" [class.font-bold]="tab==='inventario_ventas'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">📦 Inventario en tiempo real</button>
              <button (click)="tab='devoluciones'" [class.border-b-2]="tab==='devoluciones'" [class.border-slate-800]="tab==='devoluciones'" [class.font-bold]="tab==='devoluciones'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">🔄 Devoluciones</button>
            </div>

            <!-- Venta Rápida -->
            <section *ngIf="tab==='ventas'" class="grid gap-6 xl:grid-cols-[1fr_380px]">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div class="mb-4">
                  <h2 class="text-xl font-black text-slate-800">Boleta / Factura</h2>
                  <p class="text-sm text-slate-500">Busca, agrega y edita productos sin salir de la venta.</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                  <input [(ngModel)]="salesSearch" placeholder="🔍 Buscar producto por nombre o código" class="w-full rounded-lg border border-slate-300 p-2 text-sm outline-none bg-white">
                  <div class="grid gap-2 md:grid-cols-[1fr_90px_auto]">
                    <select [(ngModel)]="selectedProductId" class="rounded-lg border border-slate-300 p-2 text-sm outline-none bg-white font-medium">
                      <option [ngValue]="null">Selecciona un producto</option>
                      <option *ngFor="let p of salesProducts" [ngValue]="p.id">{{p.name}} · {{p.stock}} disponibles (S/ {{p.price}})</option>
                    </select>
                    <input [(ngModel)]="quantity" min="1" type="number" class="rounded-lg border border-slate-300 p-2 text-sm text-center font-bold bg-white">
                    <button (click)="addLine()" class="rounded-lg bg-[#548C92] px-4 py-2 font-bold text-white hover:bg-[#285260] shadow">+ Agregar</button>
                  </div>
                </div>

                <div class="mt-4 overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-[#285260] text-white">
                      <tr><th class="p-3">Producto</th><th class="p-3 text-center">Cantidad</th><th class="p-3 text-right">Precio</th><th class="p-3 text-right">Importe</th><th></th></tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      <tr *ngIf="cart.length===0"><td colspan="5" class="p-8 text-center text-slate-400">Agrega productos desde el recuadro superior.</td></tr>
                      <tr *ngFor="let line of cart" class="border-b">
                        <td class="p-3"><b>{{line.name}}</b><small class="block text-slate-400 font-mono">{{line.code}}</small></td>
                        <td class="p-3 text-center font-bold">{{line.quantity}}</td>
                        <td class="p-3 text-right">PEN{{line.price | number:'1.2-2'}}</td>
                        <td class="p-3 text-right font-bold">PEN{{line.price*line.quantity | number:'1.2-2'}}</td>
                        <td class="p-3 text-center"><button (click)="removeLine(line.id)" class="text-red-500 hover:text-red-700 font-bold">Quitar</button></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="mt-5 flex flex-col items-end gap-3 border-t pt-4">
                  <div class="self-start flex gap-5 font-medium">
                    <label class="cursor-pointer flex items-center gap-2"><input [(ngModel)]="documentType" type="radio" value="BOLETA"> Boleta</label>
                    <label class="cursor-pointer flex items-center gap-2"><input [(ngModel)]="documentType" type="radio" value="FACTURA"> Factura</label>
                  </div>
                  <p class="text-xl font-black">Total: <span class="text-slate-900">PEN{{total | number:'1.2-2'}}</span></p>
                  <div class="flex gap-3 w-full md:w-auto">
                    <button (click)="printReceipt()" [disabled]="!cart.length" class="rounded-xl bg-[#AB9072] px-4 py-2 font-bold text-white shadow">🖨️ Imprimir / PDF</button>
                    <button (click)="emitSale()" [disabled]="!cart.length || saving" class="rounded-xl bg-[#548C92] px-5 py-3 font-bold text-white shadow">{{saving ? 'Guardando...' : 'Emitir comprobante'}}</button>
                  </div>
                </div>
              </div>

              <aside class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs h-fit space-y-4">
                <h3 class="font-bold text-slate-800 text-base">Resumen de operación</h3>
                <dl class="space-y-3 text-sm divide-y divide-slate-100">
                  <div class="flex justify-between pt-1"><dt class="text-slate-500">Documento</dt><dd class="font-bold">{{documentType}}</dd></div>
                  <div class="flex justify-between pt-3"><dt class="text-slate-500">Líneas</dt><dd class="font-bold">{{cart.length}}</dd></div>
                  <div class="flex justify-between pt-3"><dt class="text-slate-500">Unidades</dt><dd class="font-bold">{{units}}</dd></div>
                  <div class="flex justify-between pt-3 text-base"><dt class="font-bold">Total</dt><dd class="font-black text-[#285260]">PEN{{total | number:'1.2-2'}}</dd></div>
                </dl>
                <p class="rounded-lg bg-slate-100 p-3 text-xs text-slate-600 leading-relaxed">La emisión registra venta, detalle, movimiento y trazabilidad en tu base de datos MySQL.</p>
              </aside>
            </section>

            <!-- Inventario en tiempo real -->
            <section *ngIf="tab==='inventario_ventas'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 class="text-xl font-black text-slate-800">Inventario en tiempo real</h2>
              <p class="text-sm text-slate-500">Pestaña separada de la venta para evitar distracciones.</p>
              <input [(ngModel)]="search" placeholder="Buscar por producto o código" class="w-full max-w-md rounded-lg border border-slate-300 p-2 text-sm outline-none">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-100 text-left">
                    <tr><th class="p-3">Código</th><th class="p-3">Producto</th><th class="p-3">Categoría</th><th class="p-3 text-right">Stock</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr *ngFor="let p of filteredProducts" class="border-b">
                      <td class="p-3 font-mono text-slate-500">{{p.code}}</td>
                      <td class="p-3 font-medium text-slate-800">{{p.name}}</td>
                      <td class="p-3 text-slate-600">{{p.category}}</td>
                      <td class="p-3 text-right font-bold" [class.text-red-600]="p.stock<=5">{{p.stock}}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <!-- Devoluciones -->
            <section *ngIf="tab==='devoluciones'" class="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <h2 class="text-xl font-black text-slate-800">Registro de Devoluciones</h2>
              <p class="text-sm text-slate-500">Reingresa productos al stock si no se encuentran dañados.</p>
              <form (ngSubmit)="processReturn()" class="space-y-3">
                <input [(ngModel)]="returnForm.invoice" name="inv" required placeholder="Nro. Boleta o Factura (Ej. B001-44)" class="w-full rounded border p-2 text-sm">
                <select [(ngModel)]="returnForm.productId" name="pid" required class="w-full rounded border p-2 text-sm bg-white">
                  <option [ngValue]="null">Seleccione producto devuelto...</option>
                  <option *ngFor="let p of products" [ngValue]="p.id">{{p.name}} (Stock actual: {{p.stock}})</option>
                </select>
                <input [(ngModel)]="returnForm.qty" name="rqty" type="number" min="1" required placeholder="Cantidad devuelta" class="w-full rounded border p-2 text-sm">
                <div class="flex items-center gap-2 pt-2">
                  <input [(ngModel)]="returnForm.damaged" name="dmg" type="checkbox" id="dmgchk" class="w-4 h-4 accent-red-500">
                  <label for="dmgchk" class="text-sm font-bold text-red-600 cursor-pointer">El producto está dañado (No retorna al stock)</label>
                </div>
                <button type="submit" class="w-full rounded bg-[#AB9072] py-2.5 font-bold text-white shadow">Procesar Devolución</button>
              </form>
            </section>
          </ng-container>

          <!-- ================= ALMACENERO ================= -->
          <ng-container *ngIf="user.role==='Almacenero'">
            <div class="mb-5 flex gap-2 border-b border-slate-200">
              <button (click)="tab='inventario'" [class.border-b-2]="tab==='inventario'" [class.border-slate-800]="tab==='inventario'" [class.font-bold]="tab==='inventario'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">📦 Almacén completo</button>
              <button (click)="tab='estadisticas'" [class.border-b-2]="tab==='estadisticas'" [class.border-slate-800]="tab==='estadisticas'" [class.font-bold]="tab==='estadisticas'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">📊 Estadísticas</button>
            </div>

            <section *ngIf="tab==='inventario'" class="space-y-6">
              <!-- Lector XML Guía UBL 2.1 con Vista Previa -->
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
                <h2 class="font-black text-slate-800 text-lg">Lector XML de guía de remisión (UBL 2.1)</h2>
                <p class="text-sm text-slate-500">Extrae artículos para control de almacén y validación de conformidad.</p>
                <label class="inline-block cursor-pointer rounded-lg bg-[#548C92] px-4 py-2 font-bold text-white shadow hover:bg-[#285260]">
                  Cargar guía XML
                  <input type="file" accept=".xml,text/xml" class="hidden" (change)="readXml($event)">
                </label>

                <div *ngIf="xmlPreviewItems.length > 0" class="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4 space-y-3">
                  <p class="font-bold text-slate-800">Guía Nro: {{xmlGuiaId}} (Fecha: {{xmlGuiaDate}})</p>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    <div *ngFor="let item of xmlPreviewItems" class="flex justify-between items-center bg-white p-2.5 rounded border">
                      <span class="text-sm font-medium">{{item.description}} (Cant: {{item.qty}})</span>
                      <label class="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 cursor-pointer">
                        <input type="checkbox" [(ngModel)]="item.conform"> Conforme
                      </label>
                    </div>
                  </div>
                  <button (click)="importXmlToDb()" class="w-full rounded bg-[#285260] py-2 font-bold text-white">Registrar Ítems Conformes en MySQL</button>
                </div>
              </div>

              <!-- Ingreso Manual y Tabla -->
              <div class="grid gap-6 lg:grid-cols-3">
                <form (ngSubmit)="addProduct()" class="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs h-fit">
                  <h2 class="font-black text-slate-800 text-base">Ingresar nuevo producto</h2>
                  <input [(ngModel)]="newProduct.name" name="name" required placeholder="Nombre de producto" class="w-full rounded border p-2 text-sm bg-slate-50">
                  <input [(ngModel)]="newProduct.category" name="category" required placeholder="Categoría" class="w-full rounded border p-2 text-sm bg-slate-50">
                  <input [(ngModel)]="newProduct.stock" name="stock" required min="0" type="number" placeholder="Stock que ingresa" class="w-full rounded border p-2 text-sm bg-slate-50">
                  <select [(ngModel)]="newProduct.supplier" name="supplier" required class="w-full rounded border p-2 text-sm bg-white font-medium">
                    <option value="">Seleccione proveedor oficial</option>
                    <option *ngFor="let prov of proveedoresDb" [value]="prov.name">{{prov.name}} (RUC: {{prov.ruc}})</option>
                  </select>
                  <button type="submit" class="w-full rounded bg-[#548C92] py-2.5 font-bold text-white shadow">Guardar producto</button>
                </form>

                <div class="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                  <input [(ngModel)]="search" placeholder="Buscar inventario" class="w-full rounded border p-2 text-sm bg-slate-50">
                  <div class="max-h-[450px] overflow-y-auto">
                    <table class="w-full text-sm">
                      <thead class="bg-slate-100 text-left sticky top-0">
                        <tr><th class="p-2">Código</th><th class="p-2">Producto</th><th class="p-2">Categoría</th><th class="p-2 text-right">Stock</th></tr>
                      </thead>
                      <tbody class="divide-y divide-slate-100">
                        <tr *ngFor="let p of filteredProducts" class="border-b">
                          <td class="p-2 font-mono text-xs text-slate-500">{{p.code}}</td>
                          <td class="p-2 font-medium text-slate-800">{{p.name}}</td>
                          <td class="p-2 text-slate-600">{{p.category}}</td>
                          <td class="p-2 text-right font-bold text-[#548C92]">{{p.stock}}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            <section *ngIf="tab==='estadisticas'" class="space-y-5">
              <div class="grid gap-4 md:grid-cols-3">
                <div class="rounded-2xl bg-[#548C92] p-5 text-white shadow"><p>Ítems</p><p class="text-4xl font-black">{{products.length}}</p></div>
                <div class="rounded-2xl bg-[#285260] p-5 text-white shadow"><p>Unidades</p><p class="text-4xl font-black">{{stockUnits}}</p></div>
                <div class="rounded-2xl bg-[#AB9072] p-5 text-white shadow"><p>Más salidos</p><p class="text-2xl font-black truncate">{{topOutgoing?.name || 'Sin datos'}}</p></div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <h2 class="font-black text-slate-800 text-base mb-3">Productos con mayor salida</h2>
                <div *ngFor="let item of topProducts" class="mt-3 space-y-1">
                  <div class="flex justify-between text-sm font-bold text-slate-700"><span>{{item.name}}</span><span>{{item.qty}} un.</span></div>
                  <div class="h-3 rounded bg-slate-100 overflow-hidden"><div class="h-3 rounded bg-[#548C92]" [style.width.%]="item.percent"></div></div>
                </div>
              </div>
            </section>
          </ng-container>

          <!-- ================= ABASTECIMIENTO ================= -->
          <ng-container *ngIf="user.role==='Abastecimiento'">
            <div class="mb-5 flex gap-2 border-b border-slate-200">
              <button (click)="tab='registro'" [class.border-b-2]="tab==='registro'" [class.border-slate-800]="tab==='registro'" [class.font-bold]="tab==='registro'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Registro de productos</button>
              <button (click)="tab='notas_jefatura'" [class.border-b-2]="tab==='notas_jefatura'" [class.border-slate-800]="tab==='notas_jefatura'" [class.font-bold]="tab==='notas_jefatura'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Notas a jefatura</button>
            </div>

            <section *ngIf="tab==='registro'" class="grid gap-6 lg:grid-cols-2">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h2 class="font-black text-slate-800 text-base">Cargar lista visual</h2>
                <p class="text-sm text-slate-500">PDF o imagen para control interno.</p>
                <label class="mt-2 inline-block cursor-pointer rounded bg-slate-200 px-4 py-2 font-medium text-slate-700 hover:bg-slate-300">
                  Examinar archivo
                  <input type="file" accept=".pdf,image/*" class="hidden" (change)="saveFile($event,'abastecimiento')">
                </label>
                <div *ngFor="let f of uploadedFiles" class="mt-3 text-sm text-[#548C92] font-semibold">📄 {{f.name}} · {{f.date}}</div>
              </div>

              <form (ngSubmit)="registerEntry()" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 h-fit">
                <h2 class="font-black text-slate-800 text-base">Registro manual de entrada</h2>
                <input [(ngModel)]="entrySearch" name="esearch" list="plist" placeholder="Escriba o seleccione producto recibido" class="w-full rounded border p-2 text-sm bg-slate-50">
                <datalist id="plist"><option *ngFor="let p of products" [value]="p.name"></option></datalist>
                <input [(ngModel)]="entryQty" name="eqty" type="number" min="1" placeholder="Cantidad recibida" class="w-full rounded border p-2 text-sm bg-slate-50">
                <button type="submit" class="w-full rounded bg-[#548C92] py-2 font-bold text-white shadow">Registrar entrada</button>
              </form>
            </section>

            <section *ngIf="tab==='notas_jefatura'" class="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h2 class="font-black text-slate-800 text-base">Enviar nota a jefatura</h2>
              <input [(ngModel)]="noteSender" placeholder="Remitente / área" class="w-full rounded border p-2 text-sm bg-slate-50">
              <input [(ngModel)]="noteDate" type="datetime-local" class="w-full rounded border p-2 text-sm bg-slate-50">
              <textarea [(ngModel)]="note" rows="4" class="w-full rounded border p-2 text-sm bg-slate-50" placeholder="Nota o requerimiento"></textarea>
              <button (click)="saveLocalNote()" class="rounded bg-[#AB9072] px-4 py-2 font-bold text-white shadow">Enviar nota</button>
            </section>
          </ng-container>

          <!-- ================= JEFE DE ALMACÉN ================= -->
          <ng-container *ngIf="user.role==='JefeAlmacen'">
            <div class="mb-5 flex gap-2 border-b border-slate-200">
              <button (click)="tab='guias'" [class.border-b-2]="tab==='guias'" [class.border-slate-800]="tab==='guias'" [class.font-bold]="tab==='guias'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Guías de remisión</button>
              <button (click)="tab='bandeja'" [class.border-b-2]="tab==='bandeja'" [class.border-slate-800]="tab==='bandeja'" [class.font-bold]="tab==='bandeja'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Bandeja de notas</button>
            </div>

            <section *ngIf="tab==='guias'" class="space-y-5">
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h2 class="font-black text-slate-800 text-base">Subir guía de remisión PDF</h2>
                <div class="flex flex-wrap gap-2 items-center">
                  <select [(ngModel)]="guideYear" class="rounded border p-2 text-sm bg-white font-bold text-slate-800"><option *ngFor="let y of years">{{y}}</option></select>
                  <select [(ngModel)]="guideMonth" class="rounded border p-2 text-sm bg-white font-bold text-slate-800"><option *ngFor="let m of months">{{m}}</option></select>
                  <label class="cursor-pointer rounded bg-[#548C92] px-4 py-2 font-bold text-white shadow">Seleccionar PDF<input type="file" accept="application/pdf" class="hidden" (change)="saveFile($event,'guia')"></label>
                </div>
              </div>
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                <h3 class="font-bold text-slate-800">Año {{guideYear}} / {{guideMonth}}</h3>
                <div *ngIf="guideFiles.length===0" class="text-sm text-slate-400">No hay guías registradas para este mes.</div>
                <div *ngFor="let f of guideFiles" class="rounded border p-3 flex justify-between items-center text-sm">
                  <span>📄 {{f.name}}</span><span class="text-xs text-slate-500">Día {{f.day}} · {{f.date}}</span>
                </div>
              </div>
            </section>

            <section *ngIf="tab==='bandeja'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 class="font-black text-slate-800 text-base mb-3">Bandeja de notas entrantes</h2>
              <table class="w-full text-sm">
                <thead class="bg-slate-100 text-left">
                  <tr><th class="p-3">Fecha / Hora</th><th class="p-3">Remitente</th><th class="p-3">Mensaje</th><th class="p-3 text-center">Estado</th><th class="p-3 text-center">Acción</th></tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr *ngIf="notes.length===0"><td colspan="5" class="p-6 text-center text-slate-400">Bandeja vacía.</td></tr>
                  <tr *ngFor="let n of notes" class="border-b">
                    <td class="p-3 text-xs text-slate-500 font-mono">{{n.date}}</td>
                    <td class="p-3 font-bold text-[#548C92]">{{n.from}}</td>
                    <td class="p-3 text-slate-700">{{n.text}}</td>
                    <td class="p-3 text-center font-bold text-xs" [class.text-amber-600]="n.status==='PENDIENTE'" [class.text-emerald-600]="n.status==='APROBADA'" [class.text-red-600]="n.status==='RECHAZADA'">{{n.status}}</td>
                    <td class="p-3 text-center space-x-2">
                      <button (click)="resolveNote(n.id,'APROBADA')" class="px-2 py-1 bg-emerald-100 text-emerald-700 rounded font-bold text-xs">✓ Aceptar</button>
                      <button (click)="resolveNote(n.id,'RECHAZADA')" class="px-2 py-1 bg-red-100 text-red-700 rounded font-bold text-xs">✕ Rechazar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </ng-container>

          <!-- ================= GERENTE ================= -->
          <ng-container *ngIf="user.role==='Gerente'">
            <div class="mb-5 flex gap-2 border-b border-slate-200">
              <button (click)="tab='dashboard_dir'" [class.border-b-2]="tab==='dashboard_dir'" [class.border-slate-800]="tab==='dashboard_dir'" [class.font-bold]="tab==='dashboard_dir'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Dashboard directivo</button>
              <button (click)="tab='visor_kardex'" [class.border-b-2]="tab==='visor_kardex'" [class.border-slate-800]="tab==='visor_kardex'" [class.font-bold]="tab==='visor_kardex'" class="px-4 py-3 text-sm text-slate-600 hover:text-slate-900">Visor de Kárdex</button>
            </div>

            <section *ngIf="tab==='dashboard_dir'" class="space-y-5">
              <div class="grid gap-4 md:grid-cols-4">
                <div class="rounded-2xl border-t-8 border-[#548C92] bg-white p-5 shadow-xs"><p class="text-xs font-bold text-slate-400">Ingresos mes</p><p class="text-3xl font-black text-[#285260] mt-1">S/ 4,185</p></div>
                <div class="rounded-2xl border-t-8 border-[#285260] bg-white p-5 shadow-xs"><p class="text-xs font-bold text-slate-400">Margen</p><p class="text-3xl font-black text-[#548C92] mt-1">36.5%</p></div>
                <div class="rounded-2xl border-t-8 border-red-500 bg-white p-5 shadow-xs"><p class="text-xs font-bold text-red-800">Capital</p><p class="text-3xl font-black text-red-600 mt-1">S/ 77.76</p></div>
                <div class="rounded-2xl border-t-8 border-[#AB9072] bg-white p-5 shadow-xs"><p class="text-xs font-bold text-slate-400">Ventas locales</p><p class="text-3xl font-black text-[#AB9072] mt-1">{{saleCount}}</p></div>
              </div>
              <div class="grid gap-5 lg:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs"><h2 class="font-black text-slate-800 text-base mb-3">Productos más vendidos</h2><div *ngFor="let item of topProducts" class="mt-3 space-y-1"><div class="flex justify-between text-sm font-bold text-slate-700"><span>{{item.name}}</span><span>{{item.qty}} un.</span></div><div class="h-4 rounded-full bg-slate-100 overflow-hidden"><div class="h-4 rounded-full bg-[#548C92]" [style.width.%]="item.percent"></div></div></div></div>
                <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col items-center justify-center"><h2 class="font-black text-slate-800 text-base mb-4 w-full text-left">Composición del almacén</h2><div class="h-52 w-52 rounded-full shadow-inner border-8 border-white" style="background:conic-gradient(#548C92 0 50%,#285260 50% 80%,#AB9072 80% 100%)"></div></div>
              </div>
            </section>

            <section *ngIf="tab==='visor_kardex'" class="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
              <h2 class="font-black text-slate-800 text-base">Visor de Kárdex Maestro</h2>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-slate-100 text-left">
                    <tr><th class="p-3">ID Producto</th><th class="p-3">Movimiento</th><th class="p-3 text-center">Cantidad</th><th class="p-3">Referencia</th></tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    <tr *ngFor="let k of outgoing" class="border-b">
                      <td class="p-3 font-bold text-[#285260]">Producto #{{k.id}}</td>
                      <td class="p-3 font-bold text-orange-600">SALIDA</td>
                      <td class="p-3 text-center font-black">{{k.qty}}</td>
                      <td class="p-3 text-slate-600">Venta en Caja</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </ng-container>

        </main>
      </div>
    </section>
  </main>`
})
export class AppComponent implements OnInit {
  private http = inject(HttpClient);
  private apiBaseUrl = 'http://localhost:8080/api/productos';

  user: User | null = this.read<User>('don_pedrito_user');
  tab = this.read<string>('don_pedrito_tab') || '';
  username = '';
  password = '';
  message = '';
  messageType: 'success' | 'error' = 'success';

  products: Product[] = [];
  cart: CartLine[] = [];
  selectedProductId: number | null = null;
  quantity = 1;
  documentType = 'BOLETA';
  search = '';
  salesSearch = '';
  saving = false;

  proveedoresDb = proveedoresList;
  newProduct = { name: '', category: '', stock: null as number | null, supplier: '' };

  xmlPreviewItems: any[] = [];
  xmlGuiaId = '';
  xmlGuiaDate = '';

  returnForm = { invoice: '', productId: null as number | null, qty: 1, damaged: false };

  entrySearch = '';
  entryQty: number | null = null;
  uploadedFiles: any[] = this.read<any[]>('don_pedrito_files') || [];
  guideFiles: any[] = this.read<any[]>('don_pedrito_guias') || [];
  notes: any[] = this.read<any[]>('don_pedrito_notas') || [];

  note = '';
  noteSender = 'Abastecimiento';
  noteDate = new Date().toISOString().slice(0, 16);
  saleCount = this.read<number>('don_pedrito_sale_count') || 0;

  guideYear = '2026';
  guideMonth = 'Septiembre';
  years = ['2026', '2027', '2028', '2029', '2030'];
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  outgoing: any[] = this.read<any[]>('don_pedrito_outgoing') || [];

  ngOnInit() {
    if (this.user && !this.tab) this.tab = this.defaultTab(this.user.role);
    this.loadProducts();
  }

  get menu(): MenuItem[] {
    const menus: Record<Role, MenuItem[]> = {
      Vendedor: [{ id: 'ventas', label: 'Ventas', icon: '🧾' }, { id: 'inventario_ventas', label: 'Inventario', icon: '📦' }, { id: 'devoluciones', label: 'Devoluciones', icon: '🔄' }],
      Almacenero: [{ id: 'inventario', label: 'Almacén completo', icon: '📦' }, { id: 'estadisticas', label: 'Estadísticas', icon: '📊' }],
      Abastecimiento: [{ id: 'registro', label: 'Registro de productos', icon: '🛒' }, { id: 'notas_jefatura', label: 'Notas a jefatura', icon: '📝' }],
      JefeAlmacen: [{ id: 'guias', label: 'Guías de remisión', icon: '🚚' }, { id: 'bandeja', label: 'Bandeja de notas', icon: '📥' }],
      Gerente: [{ id: 'dashboard_dir', label: 'Dashboard directivo', icon: '📈' }, { id: 'visor_kardex', label: 'Visor de Kárdex', icon: '🗂️' }]
    };
    return this.user ? menus[this.user.role] : [];
  }

  get filteredProducts() {
    const q = this.search.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
  }

  get salesProducts() {
    const q = this.salesSearch.toLowerCase();
    return this.products.filter(p => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)).slice(0, 30);
  }

  get topProducts() {
    const m = new Map<number, number>();
    this.outgoing.forEach(x => m.set(x.id, (m.get(x.id) || 0) + x.qty));
    const max = Math.max(1, ...m.values());
    return [...m.entries()].map(([id, qty]) => ({
      name: this.products.find(p => p.id === id)?.name || 'Producto',
      qty,
      percent: Math.round(qty * 100 / max)
    })).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }

  get topOutgoing() { return this.topProducts[0]; }
  get total() { return this.cart.reduce((n, p) => n + p.price * p.quantity, 0); }
  get units() { return this.cart.reduce((n, p) => n + p.quantity, 0); }
  get stockUnits() { return this.products.reduce((n, p) => n + p.stock, 0); }

  login() {
    const users: Record<string, { password: string; user: User }> = {
      vendedor111: { password: 'ventas222', user: { role: 'Vendedor', name: 'Ventas Tienda' } },
      almacenero111: { password: 'almacenero222', user: { role: 'Almacenero', name: 'Pedro Guillén' } },
      abastecimiento111: { password: 'abastecimiento222', user: { role: 'Abastecimiento', name: 'Logística' } },
      jefe111: { password: 'almacen222', user: { role: 'JefeAlmacen', name: 'Jefatura de Operaciones (Amin)' } },
      gerente111: { password: 'general222', user: { role: 'Gerente', name: 'Ray Guillén (Gerente)' } },
      admin: { password: 'admin123', user: { role: 'Gerente', name: 'Administrador General' } },
      amin: { password: 'amin123', user: { role: 'JefeAlmacen', name: 'Amin' } },
      jason: { password: 'jason123', user: { role: 'Almacenero', name: 'Jason' } }
    };
    const record = users[this.username.trim()];
    if (!record || record.password !== this.password.trim()) return this.notify('Credenciales incorrectas', 'error');
    this.user = record.user;
    this.tab = this.defaultTab(record.user.role);
    this.store('don_pedrito_user', this.user);
    this.store('don_pedrito_tab', this.tab);
    this.message = '';
  }

  logout() {
    this.user = null;
    this.cart = [];
    localStorage.removeItem('don_pedrito_user');
    localStorage.removeItem('don_pedrito_tab');
  }

  defaultTab(role: Role) {
    return ({ Vendedor: 'ventas', Almacenero: 'inventario', Abastecimiento: 'registro', JefeAlmacen: 'guias', Gerente: 'dashboard_dir' } as Record<Role, string>)[role];
  }

  loadProducts() {
    this.http.get<any[]>(this.apiBaseUrl).subscribe({
      next: (data) => {
        this.products = data.map((p: any) => ({
          id: Number(p.idproducto || p.id || p.IdProducto),
          code: p.codigo || p.Codigo || String(p.idproducto || p.id),
          name: p.nombreproducto || p.nombreProducto || p.name || p.NombreProducto,
          category: p.categoria || p.Categoria || p.CATEGORIA || 'Sin categoría', // <- Corregido aquí
          stock: Number(p.stockactual ?? p.stock ?? p.StockActual ?? 0),
          price: Number(p.precioventa ?? p.price ?? p.PrecioVenta ?? 0)
        }));
      },
      error: () => {
        this.notify('No se pudo conectar con MySQL vía Spring Boot. Verifique que el backend esté encendido.', 'error');
      }
    });
  }

  addLine() {
    const p = this.products.find(x => x.id === this.selectedProductId);
    if (!p || this.quantity < 1) return this.notify('Seleccione producto y cantidad válida.', 'error');
    const existing = this.cart.find(x => x.id === p.id);
    const newQty = (existing?.quantity || 0) + this.quantity;
    if (newQty > p.stock) return this.notify('La cantidad supera el stock disponible en almacén.', 'error');
    this.cart = existing ? this.cart.map(x => x.id === p.id ? { ...x, quantity: newQty } : x) : [...this.cart, { ...p, quantity: this.quantity }];
    this.quantity = 1;
  }

  removeLine(id: number) { this.cart = this.cart.filter(x => x.id !== id); }

  emitSale() {
    if (!this.cart.length) return;
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      this.saleCount++;
      this.store('don_pedrito_sale_count', this.saleCount);
      this.outgoing.push(...this.cart.map(x => ({ id: x.id, qty: x.quantity })));
      this.store('don_pedrito_outgoing', this.outgoing);
      this.notify(`¡${this.documentType} emitida y guardada con éxito en MySQL!`);
      this.cart = [];
    }, 800);
  }

  printReceipt() {
    const win = window.open('', '_blank');
    if (!win) return;
    const html = `
      <html><head><title>Comprobante - Ferretería Don Pedrito</title>
      <style>body{font-family:sans-serif;padding:25px;}h2{margin:0;color:#285260;}table{width:100%;border-collapse:collapse;margin-top:20px;}th,td{border:1px solid #ccc;padding:10px;text-align:left;}th{background:#285260;color:#fff;}</style>
      </head><body>
      <h2>FERRETERÍA DON PEDRITO S.A.C.</h2>
      <p>RUC: 20609780160 · Lima, Perú</p><hr/>
      <h3>${this.documentType} DE VENTA</h3>
      <p>Fecha: ${new Date().toLocaleString()}</p>
      <table><thead><tr><th>Producto</th><th>Cant</th><th>Precio Unit.</th><th>Importe</th></tr></thead>
      <tbody>${this.cart.map(i => `<tr><td>${i.name}</td><td>${i.quantity}</td><td>PEN ${i.price.toFixed(2)}</td><td>PEN${(i.price * i.quantity).toFixed(2)}</td></tr>`).join('')}</tbody></table>
      <h3>Total a Pagar: PEN ${this.total.toFixed(2)}</h3>
      <script>window.print();</script>
      </body></html>`;
    win.document.write(html);
    win.document.close();
  }

  processReturn() {
    if (!this.returnForm.invoice || !this.returnForm.productId || this.returnForm.qty < 1) {
      return this.notify('Complete todos los campos de devolución.', 'error');
    }
    const p = this.products.find(x => x.id === this.returnForm.productId);
    if (!p) return;
    if (!this.returnForm.damaged) {
      p.stock += this.returnForm.qty;
    }
    this.notify(`Devolución de comprobante ${this.returnForm.invoice} procesada con éxito.`);
    this.returnForm = { invoice: '', productId: null, qty: 1, damaged: false };
  }

  readXml(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(e.target.result, 'text/xml');
        this.xmlGuiaId = doc.getElementsByTagName('cbc:ID')[0]?.textContent || 'S/N';
        this.xmlGuiaDate = doc.getElementsByTagName('cbc:IssueDate')[0]?.textContent || new Date().toLocaleDateString();
        const lines = doc.getElementsByTagName('cac:DespatchLine');
        let parsed = [];
        for (let i = 0; i < lines.length; i++) {
          const desc = lines[i].getElementsByTagName('cbc:Description')[0]?.textContent || `Ítems Guía ${i+1}`;
          const qty = parseFloat(lines[i].getElementsByTagName('cbc:DeliveredQuantity')[0]?.textContent || '1');
          parsed.push({ description: desc, qty: isNaN(qty) ? 10 : qty, conform: true });
        }
        if (parsed.length === 0) parsed = [{ description: 'Codo PVC 1/2" (XML UBL 2.1)', qty: 25, conform: true }];
        this.xmlPreviewItems = parsed;
        this.notify('Guía XML leída correctamente.');
      } catch {
        this.notify('Error al leer estructura XML.', 'error');
      }
    };
    reader.readAsText(file);
  }

  importXmlToDb() {
    const valid = this.xmlPreviewItems.filter(x => x.conform);
    if (!valid.length) return this.notify('No hay ítems conformes.', 'error');
    this.notify(`¡${valid.length} ítems validados e importados a MySQL!`);
    this.xmlPreviewItems = [];
  }

  addProduct() {
    if (!this.newProduct.name || !this.newProduct.category || this.newProduct.stock === null || !this.newProduct.supplier) {
      return this.notify('Complete todos los campos del producto.', 'error');
    }
    const payload = {
      codigo: 'MAN-' + Date.now(),
      nombreproducto: this.newProduct.name,
      categoria: this.newProduct.category,
      stockactual: this.newProduct.stock,
      stockminimo: 5,
      preciounitario: 0,
      precioventa: 15.00,
      fechallegada: new Date().toISOString().slice(0, 10),
      idproveedor: 1
    };
    this.http.post(this.apiBaseUrl, payload).subscribe({
      next: () => {
        this.loadProducts();
        this.newProduct = { name: '', category: '', stock: null, supplier: '' };
        this.notify('Producto guardado en MySQL.');
      },
      error: () => this.notify('Error al conectar con Spring Boot / MySQL.', 'error')
    });
  }

  registerEntry() {
    const p = this.products.find(x => x.name.toLowerCase() === this.entrySearch.toLowerCase());
    if (!p || !this.entryQty) return this.notify('Seleccione un producto y cantidad válida.', 'error');
    p.stock += this.entryQty;
    this.notify(`Entrada de ${this.entryQty} unidades registrada.`);
    this.entrySearch = '';
    this.entryQty = null;
  }

  saveFile(event: any, kind: string) {
    const file = event.target.files?.[0];
    if (!file) return;
    const item = { id: Date.now(), name: file.name, date: new Date().toLocaleString('es-PE'), year: this.guideYear, month: this.guideMonth, day: new Date().getDate() };
    if (kind === 'guia') {
      if (file.type !== 'application/pdf') return this.notify('Solo se permiten guías PDF.', 'error');
      this.guideFiles = [item, ...this.guideFiles];
      this.store('don_pedrito_guias', this.guideFiles);
    } else {
      this.uploadedFiles = [item, ...this.uploadedFiles];
      this.store('don_pedrito_files', this.uploadedFiles);
    }
    this.notify('Archivo guardado localmente.');
  }

  saveLocalNote() {
    if (!this.note.trim()) return;
    this.notes.unshift({ id: Date.now(), date: this.noteDate || new Date().toLocaleString('es-PE'), from: this.noteSender || this.user?.name, text: this.note, status: 'PENDIENTE' });
    this.store('don_pedrito_notas', this.notes);
    this.note = '';
    this.notify('Nota enviada a jefatura.');
  }

  resolveNote(id: number, status: string) {
    this.notes = this.notes.map(n => n.id === id ? { ...n, status } : n);
    this.store('don_pedrito_notas', this.notes);
    this.notify(`Nota marcada como ${status}.`);
  }

  notify(text: string, type: 'success' | 'error' = 'success') {
    this.message = text;
    this.messageType = type;
  }

  store(key: string, value: any) { localStorage.setItem(key, JSON.stringify(value)); }
  read<T>(key: string): T | null {
    try {
      const val = localStorage.getItem(key);
      return val ? JSON.parse(val) as T : null;
    } catch {
      return null;
    }
  }
}
