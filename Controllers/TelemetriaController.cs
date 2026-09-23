using CanSat_Tecnm.Data;
using CanSat_Tecnm.Hubs;
using CanSat_Tecnm.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace CanSat_Tecnm.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TelemetriaController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IHubContext<TelemetriaHub> _hubContext;

        public TelemetriaController(ApplicationDbContext context, IHubContext<TelemetriaHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        [HttpPost]
        public async Task<IActionResult> RecibirDatos([FromBody] Telemetria datos)
        {
            // 1. Guardar en SQLite para el reporte PFR
            _context.RegistrosTelemetria.Add(datos);
            await _context.SaveChangesAsync();

            // 2. Enviar a la Vista de Matamoros al instante
            await _hubContext.Clients.All.SendAsync("ActualizarDashboard", datos);

            return Ok(new { status = "recibido" });
        }
    }
}