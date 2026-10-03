using CanSat_Tecnm.Data;
using CanSat_Tecnm.Hubs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configurar SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=cansat_telemetria.db"));

builder.Services.AddControllersWithViews();
builder.Services.AddSignalR(); // Inyectar SignalR

var app = builder.Build();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

// Mapeo de rutas para MVC y WebSockets
app.MapHub<TelemetriaHub>("/telemetriaHub");
app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Crear la base de datos automáticamente al iniciar si no existe
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.EnsureCreated();
}

app.Run();