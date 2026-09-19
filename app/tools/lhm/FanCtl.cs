/* Forge fan controller - free OSS via LibreHardwareMonitor. list | set <id> <0-100> */
using System;
using System.Collections.Generic;
using LibreHardwareMonitor.Hardware;

class UpdateAll : IVisitor
{
    public void VisitComputer(IComputer c) { c.Traverse(this); }
    public void VisitHardware(IHardware h) { h.Update(); foreach (var s in h.SubHardware) s.Accept(this); }
    public void VisitSensor(ISensor s) { }
    public void VisitParameter(IParameter p) { }
}

class FanCtl
{
    static string Esc(string s)
    {
        return s.Replace("\\", "\\\\").Replace("\"", "\\\"");
    }

    static void Main(string[] args)
    {
        try
        {
            if (args.Length == 0) throw new Exception("use: list | set <id> <0-100>");
            var computer = new Computer
            {
                IsCpuEnabled = true, IsGpuEnabled = true, IsMotherboardEnabled = true,
                IsMemoryEnabled = false, IsStorageEnabled = false, IsControllerEnabled = true,
                IsBatteryEnabled = false, IsPsuEnabled = true
            };
            computer.Open();
            computer.Accept(new UpdateAll());
            if (args[0] == "list")
            {
                var items = new List<string>();
                foreach (var hw in computer.Hardware) Collect(hw, items);
                Console.WriteLine("[" + string.Join(",", items.ToArray()) + "]");
            }
            else if (args[0] == "set" && args.Length == 3)
            {
                string id = args[1];
                float pct = Math.Max(0, Math.Min(100, float.Parse(args[2])));
                bool found = false;
                foreach (var hw in computer.Hardware) if (Apply(hw, id, pct)) found = true;
                Console.WriteLine(found ? "{\"ok\":true}" : "{\"error\":\"control-not-found\"}");
            }
            else throw new Exception("use: list | set <id> <0-100>");
            computer.Close();
        }
        catch (Exception e) { Console.WriteLine("{\"error\":\"" + Esc(e.Message) + "\"}"); }
    }

    static void Collect(IHardware hw, List<string> items)
    {
        foreach (var s in hw.Sensors)
        {
            if (s.SensorType == SensorType.Control || s.SensorType == SensorType.Fan)
                items.Add("{\"id\":\"" + Esc(s.Identifier.ToString()) + "\",\"name\":\"" + Esc(s.Name) +
                    "\",\"hw\":\"" + Esc(hw.Name) + "\",\"type\":\"" + s.SensorType + "\",\"value\":" +
                    (s.Value.HasValue ? s.Value.Value.ToString("0.##") : "null") + "}");
        }
        foreach (var sub in hw.SubHardware) Collect(sub, items);
    }

    static bool Apply(IHardware hw, string id, float pct)
    {
        bool done = false;
        foreach (var s in hw.Sensors)
        {
            if (s.SensorType == SensorType.Control && s.Identifier.ToString() == id && s.Control != null)
            {
                s.Control.SetSoftware(pct);
                done = true;
            }
        }
        foreach (var sub in hw.SubHardware) if (Apply(sub, id, pct)) done = true;
        return done;
    }
}
